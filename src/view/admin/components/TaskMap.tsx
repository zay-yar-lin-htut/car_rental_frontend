import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

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

interface LatLngPt {
	lat: number;
	lng: number;
}

const RoutingMachine = ({ start, end, type }: {
	start: LatLngPt | null;
	end: LatLngPt;
	type: string;
}) => {
	const map = useMap();

	useEffect(() => {
		if (!map || !start || !end) return;

		const routingControl = L.Routing.control({
			waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
			router: new L.Routing.TomTom(import.meta.env.VITE_TOMTOM_KEY),
			routeWhileDragging: true,
			show: false, // Set to true to show the itinerary panel
			addWaypoints: false,
			draggableWaypoints: false,
			fitSelectedRoutes: true,
			lineOptions: {
				styles: [
					{ color: "black", opacity: 0.15, weight: 9 },
					{ color: "white", opacity: 0.8, weight: 6 },
					{ color: "#007bff", opacity: 1, weight: 4, dashArray: "10, 10" },
				],
			},
			// Use custom icons
            createMarker: function (i: number, waypoint: any) {
				const isStart = i === 0;
				const markerIcon = L.divIcon({
					html: `<div class="map-marker-pin ${
						isStart ? "start" : "end"
					}"></div>`,
					className: "map-marker",
					iconSize: [24, 24],
					iconAnchor: [12, 24],
					popupAnchor: [0, -24],
				});

				const markerOptions = {
					draggable: false,
					icon: markerIcon,
				};

				const marker = L.marker(waypoint.latLng, markerOptions);

				const popupContent = isStart
					? "Your Location"
					: `${type} Destination`;

				marker.bindPopup(popupContent);

				return marker;
			},
		}).addTo(map);

		return () => {
			map.removeControl(routingControl);
		};
	}, [map, start, end, type]);

	return null;
};

const TaskMap = ({ start, end, type }: {
	start: LatLngPt | null;
	end: LatLngPt;
	type: string;
}) => {
	// Center on end initially, or start if available
	const center: [number, number] = start ? [start.lat, start.lng] : [end.lat, end.lng];

	return (
		<MapContainer
			center={center}
			zoom={13}
			style={{ height: "100%", width: "100%" }}>
			<TileLayer
				url={`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${import.meta.env.VITE_TOMTOM_KEY}`}
				attribution='&copy; <a href="https://www.tomtom.com">TomTom</a>'
			/>
			{end && (
				<Marker position={[end.lat, end.lng]}>
					<Popup>{type} Location</Popup>
				</Marker>
			)}
			{start && end && (
				<RoutingMachine
					start={start}
					end={end}
					type={type}
				/>
			)}
		</MapContainer>
	);
};

export default TaskMap;
