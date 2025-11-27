import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

const RoutingMachine = ({ start, end, type }) => {
	const map = useMap();

	useEffect(() => {
		if (!map || !start || !end) return;

		const routingControl = L.Routing.control({
			waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
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
			createMarker: function (i, waypoint, n) {
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

		return () => map.removeControl(routingControl);
	}, [map, start, end, type]);

	return null;
};

const TaskMap = ({ start, end, type }) => {
	// Center on end initially, or start if available
	const center = start ? [start.lat, start.lng] : [end.lat, end.lng];

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
