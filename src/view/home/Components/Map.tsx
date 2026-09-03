import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Custom TomTom Router
L.Routing = L.Routing || {};
L.Routing.TomTom = L.Class.extend({
    options: {
        serviceUrl: "https://api.tomtom.com/routing/1/calculateRoute",
        timeout: 30 * 1000,
        routeType: "fastest",
        language: "",
        instructionsType: "",
        traffic: true,
        avoid: "",
        travelMode: "car",
        vehicleMaxSpeed: 0,
        vehicleWeight: 0,
        vehicleAxleWeight: 0,
        vehicleLength: 0,
        vehicleWidth: 0,
        vehicleHeight: 0,
        departAt: "",
        arriveAt: "",
        vehicleCommercial: false
    },

    initialize: function(apiKey: any, options: any) {
        this._apiKey = apiKey;
        L.Util.setOptions(this, options);
    },

    route: function(waypoints: any, callback: any, context: any, opts: any) {
        var timedOut = false,
            wps: any[] = [],
            url,
            timer: any,
            wp,
            i;

        opts = opts || {};
        url = this.buildRouteUrl(waypoints, opts);

        timer = setTimeout(function() {
                            timedOut = true;
                            callback.call(context || callback, {
                                status: -1,
                                message: 'TomTom request timed out.'
                            });
                        }, this.options.timeout);

        for (i = 0; i < waypoints.length; i++) {
            wp = waypoints[i];
            wps.push({
                latLng: wp.latLng,
                name: wp.name,
                options: wp.options
            });
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                clearTimeout(timer);
                if (!timedOut) {
                    this._routeDone(data, wps, callback, context);
                }
            })
            .catch(err => {
                clearTimeout(timer);
                if (!timedOut) {
                    callback.call(context || callback, {
                        status: -1,
                        message: 'HTTP request failed: ' + err.message
                    });
                }
            });

        return this;
    },

    _routeDone: function(response: any, inputWaypoints: any, callback: any, context: any) {
        var alts = [],
            mappedWaypoints,
            coordinates: any[] = [],
            i,
            path,
            summary = [],
            instructions,
            index = 0;

        context = context || callback;
        if (response.error && response.error.description) {
            callback.call(context, {
                status: -1,
                message: response.error.description
            });
            return;
        }

        for (i = 0; i < response.routes[0].legs.length; i++) {
            path = response.routes[0].legs[i];
            coordinates = coordinates.concat(this._decodePolyline(path.points));
            index += (path.points.length - 1);
            summary.push({ summary: path.summary, index: index });
        }

        instructions = this._convertInstructions(summary);
        mappedWaypoints = this._mapWaypointIndices(inputWaypoints, instructions, coordinates);

        alts = [{
            name: '',
            coordinates: coordinates,
            instructions: instructions,
            summary: this._convertSummary(summary),
            inputWaypoints: inputWaypoints,
            actualWaypoints: mappedWaypoints.waypoints,
            waypointIndices: mappedWaypoints.waypointIndices
        }];

        callback.call(context, null, alts);
    },

    _decodePolyline: function(geometry: any) {
        var coords = geometry,
            latlngs = new Array(coords.length),
            i;

        for (i = 0; i < coords.length; i++) {
            latlngs[i] = new L.LatLng(coords[i].latitude, coords[i].longitude);
        }

        return latlngs;
    },

    _toWaypoints: function(inputWaypoints: any, vias: any) {
        var wps = [],
            i;
        for (i = 0; i < vias.length; i++) {
            wps.push({
                latLng: L.latLng(vias[i]),
                name: inputWaypoints[i].name,
                options: inputWaypoints[i].options
            });
        }

        return wps;
    },

    buildRouteUrl: function(waypoints: any) {
        var locs = [],
            i,
            _options: { [key: string]: any } = {
                        routeType: this.options.routeType,
                        language: this.options.language,
                        instructionsType: this.options.instructionsType,
                        traffic: this.options.traffic,
                        avoid: this.options.avoid,
                        travelMode: this.options.travelMode,
                        vehicleMaxSpeed: this.options.vehicleMaxSpeed,
                        vehicleWeight: this.options.vehicleWeight,
                        vehicleAxleWeight: this.options.vehicleAxleWeight,
                        vehicleLength: this.options.vehicleLength,
                        vehicleWidth: this.options.vehicleWidth,
                        vehicleHeight: this.options.vehicleHeight,
                        vehicleCommercial: this.options.vehicleCommercial
                };

        if (_options.avoid == "" || (_options.avoid as string[])?.length === 0)
            delete _options.avoid;

        if (_options.instructionsType == "")
            delete _options.instructionsType;

        if (_options.language == "")
            delete _options.language;

        if (this.options.departAt && this.options.departAt.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/))
            _options.departAt = this.options.departAt;
        else if (this.options.arriveAt && this.options.arriveAt.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/))
            _options.arriveAt = this.options.arriveAt;

        for (i = 0; i < waypoints.length; i++)
            locs.push(waypoints[i].latLng.lat + ',' + waypoints[i].latLng.lng);

        return this.options.serviceUrl + '/' + locs.join(':') + '/json?key=' +
                this._apiKey + '&' + Object.keys(_options).map(function(k) {
                    return encodeURIComponent(k) + '=' + encodeURIComponent(_options[k])
                }).join('&');
    },

    _convertInstructions: function(summaries: any) {
        var result = [],
            i;

        for (i = 0; i < summaries.length; i++) {
            result.push({ distance: summaries[i].summary.lengthInMeters,
                          time: summaries[i].summary.travelTimeInSeconds,
                          type: (i == summaries.length - 1 ? "DestinationReached" : "WaypointReached"),
                          index: summaries[i].index });
        }

        return result;
    },

    _convertSummary: function(summaries: any) {
        var result = { totalDistance: 0,
                       totalTime: 0 },
            i;

        for (i = 0; i < summaries.length; i++) {
            result.totalDistance += summaries[i].summary.lengthInMeters;
            result.totalTime += summaries[i].summary.travelTimeInSeconds;
        }

        return result;
    },

    _mapWaypointIndices: function(waypoints: any, instructions: any, coordinates: any) {
        var wps = [],
            wpIndices = [],
            i,
            idx;

        wpIndices.push(0);
        wps.push({ latLng: coordinates[0], name: waypoints[0].name });

        for (i = 0; i < instructions.length; i++) {
            if (instructions[i].type === "WaypointReached") {
                idx = instructions[i].index;
                wpIndices.push(idx);
                wps.push({
                    latLng: coordinates[idx],
                    name: waypoints[wps.length].name
                });
            }
        }

        wpIndices.push(coordinates.length - 1);
        wps.push({
            latLng: coordinates[coordinates.length - 1],
            name: waypoints[waypoints.length - 1].name
        });

        return {
            waypointIndices: wpIndices,
            waypoints: wps
        };
    }
});

L.Routing.tomTom = function(apiKey: any, options: any) {
    return new L.Routing.TomTom(apiKey, options);
};
import {
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Button,
  Box,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { createDataServices } from "../../../services/DataServices";
import { API_ENDPOINTS } from "../../../services/Configuration";

// Icons
const selectedMarker = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149059.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -38],
});

const humanIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

// This component FORCES map to move to active marker
export interface ActiveMarker {
	position: [number, number];
	name?: string;
}

interface MapSuggestion {
	display_name: string;
	lat: number;
	lon: number;
}

interface MapComponentProps {
	currentPosition?: [number, number] | null;
	showRoute: boolean;
	onMapClick: (latlng: { lat: number; lng: number }) => void;
	activeMarker: ActiveMarker | null;
	onPickupSelect: (m: ActiveMarker) => void;
	onDropoffSelect: (m: ActiveMarker) => void;
	onClose: () => void;
	selectionMode: string;
	searchTerm: string;
	onSuggestionsChange: (s: MapSuggestion[]) => void;
}

const FlyToMarker = ({ activeMarker }: { activeMarker: ActiveMarker | null }) => {
  const map = useMap();

  useEffect(() => {
    if (activeMarker && activeMarker.position && activeMarker.position.length === 2) {
      const lat = activeMarker.position[0];
      const lng = activeMarker.position[1];

      // Smooth fly with zoom
      map.flyTo([lat, lng], 16, {
        duration: 1.2,
        easeLinearity: 0.25,
      });

      // Optional: small bounce effect
      setTimeout(() => {
        map.setView([lat + 0.0005, lng], 16); // tiny nudge to trigger marker animation
        setTimeout(() => map.setView([lat, lng], 16), 300);
      }, 1300);
    }
  }, [activeMarker, map]);

  return null;
};

// Routing component
const MapUpdater = ({ currentPosition, destination, showRoute }: {
	currentPosition?: [number, number] | null;
	destination: ActiveMarker | null;
	showRoute: boolean;
}) => {
  const map = useMap();

  useEffect(() => {
    if (!showRoute || !currentPosition || !destination?.position) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Routing.Control) {
        map.removeControl(layer);
      }
    });

    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary-color") || "#007BFF";

    L.Routing.control({
      waypoints: [
        L.latLng(currentPosition[0], currentPosition[1]),
        L.latLng(destination.position[0], destination.position[1]),
      ],
      router: new L.Routing.TomTom(import.meta.env.VITE_TOMTOM_KEY),
      lineOptions: { styles: [{ color: primaryColor, weight: 6, opacity: 0.8 }] },
      addWaypoints: false,
      draggableWaypoints: false,
      createMarker: () => null,
      show: false,
      routeWhileDragging: false,
    }).addTo(map);

    // Fit bounds
    const bounds = L.latLngBounds([currentPosition, destination.position]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [currentPosition, destination, showRoute, map]);

  return null;
};

// Map click handler component
const MapClickHandler = ({ onMapClick }: { onMapClick: (latlng: { lat: number; lng: number }) => void }) => {
  const map = useMap();

  useEffect(() => {
    if (!onMapClick) return;

    const handleMapClick = (e: any) => {
      onMapClick(e.latlng);
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, onMapClick]);

  return null;
};

const Map = ({
  currentPosition,
  showRoute,
  onMapClick,
  activeMarker,
  onPickupSelect,
  onDropoffSelect,
  onClose,
  selectionMode,
  searchTerm,
  onSuggestionsChange,
}: MapComponentProps) => {

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchTerm && searchTerm.length > 2) {
        triggerSearch();
      } else {
        onSuggestionsChange?.([]);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const triggerSearch = async () => {
    try {
      const key = import.meta.env.VITE_TOMTOM_KEY;
      const res = await fetch(
        `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(searchTerm)}.json?key=${key}&limit=8`
      );
      const data = await res.json();
      const suggestions = (data.results || []).map((r: any) => ({
        display_name: r.address.freeformAddress,
        lat: r.position.lat,
        lon: r.position.lon,
      }));
      onSuggestionsChange?.(suggestions);
    } catch (err) {
      console.error("TomTom search failed:", err);
      onSuggestionsChange?.([]);
    }
  };

  const handlePopupSelect = async () => {
    if (!activeMarker) return;
    try {
      const dataServices = createDataServices();
      await dataServices.retrievePOST(
        {
          location_name: activeMarker.name,
          latitude: activeMarker.position[0],
          longitude: activeMarker.position[1],
        },
        API_ENDPOINTS.userPreferenceLocations.base + API_ENDPOINTS.userPreferenceLocations.add
      );
    } catch (err) {
      console.error("Failed to save preference:", err);
    }

    if (selectionMode === "pickup") {
      onPickupSelect(activeMarker);
    } else {
      onDropoffSelect(activeMarker);
    }
    onClose();
  };

  return (
    <MapContainer
      center={[16.8, 96.1]}
      zoom={13}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; TomTom'
        url={`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${import.meta.env.VITE_TOMTOM_KEY}`}
      />

      {/* THIS IS THE KEY: Forces map to FLY to selected location */}
      <FlyToMarker activeMarker={activeMarker} />

      {/* Show selected marker */}
      {activeMarker && activeMarker.position && (
        <Marker position={activeMarker.position} icon={selectedMarker}>
          <Popup autoClose={false} closeOnClick={false}>
            <Box sx={{ textAlign: "center", p: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {activeMarker.name}
              </Typography>
              <Button
                variant="contained"
                size="small"
                fullWidth
                sx={{ mt: 1 }}
                onClick={handlePopupSelect}
              >
                Select This Location
              </Button>
            </Box>
          </Popup>
        </Marker>
      )}

      {/* Current user position */}
      {currentPosition && (
        <Marker position={currentPosition} icon={humanIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {/* Route */}
      <MapUpdater
        currentPosition={currentPosition}
        destination={activeMarker}
        showRoute={showRoute}
      />

      {/* Handle map clicks */}
      <MapClickHandler onMapClick={onMapClick} />
    </MapContainer>
  );
};

export default Map;