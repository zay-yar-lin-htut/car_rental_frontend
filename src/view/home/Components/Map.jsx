import React, { useEffect, useRef, useState } from "react";
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
const customMarker = new L.Icon({
  iconUrl: "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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
const FlyToMarker = ({ activeMarker }) => {
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
const MapUpdater = ({ currentPosition, destination, showRoute }) => {
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

const Map = ({
  selectedLocation,
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
}) => {
  const [map, setMap] = useState(null);

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
      const suggestions = (data.results || []).map(r => ({
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
      whenCreated={setMap}
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

      {/* Click to select */}
      {onMapClick && (
        <div
          style={{ pointerEvents: "none" }}
          onClick={(e) => {
            e.stopPropagation();
            const latlng = map?.mouseEventToLatLng(e.nativeEvent);
            if (latlng) onMapClick(latlng);
          }}
        />
      )}
    </MapContainer>
  );
};

export default Map;