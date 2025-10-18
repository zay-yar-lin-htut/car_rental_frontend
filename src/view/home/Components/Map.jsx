import React, { useEffect, useState } from "react";
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

// Custom blue marker
const customMarker = new L.Icon({
	iconUrl:
		"https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

// Component to handle routing to a selected location
const MapUpdater = ({ currentPosition, selectedLocation, showRoute }) => {
	const map = useMap();

	useEffect(() => {
		// Remove any existing routing control
		map.eachLayer((layer) => {
			if (layer instanceof L.Routing.Control) map.removeControl(layer);
		});

		if (showRoute && currentPosition && selectedLocation) {
			L.Routing.control({
				waypoints: [
					L.latLng(currentPosition[0], currentPosition[1]),
					L.latLng(selectedLocation.position[0], selectedLocation.position[1]),
				],
				lineOptions: { styles: [{ color: "#00F5D4", weight: 5 }] },
				addWaypoints: false,
				draggableWaypoints: false,
				createMarker: () => null,
				show: false, // hide directions box
				routeWhileDragging: false,
			}).addTo(map);

			map.fitBounds([currentPosition, selectedLocation.position]);
		} else if (selectedLocation) {
			map.flyTo(selectedLocation.position, 13);
		}
	}, [currentPosition, selectedLocation, showRoute, map]);

	return null;
};

const Map = ({ selectedLocation, currentPosition, showRoute, locations }) => {
	const mapRef = React.useRef();

	return (
		<MapContainer
			center={selectedLocation.position}
			zoom={13}
			scrollWheelZoom
			style={{ height: "100%", width: "100%" }}
			whenCreated={(map) => (mapRef.current = map)}>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>

			{locations.map((loc) => (
				<Marker
					key={loc.name}
					position={loc.position}
					icon={customMarker}
					eventHandlers={{
						click: () => {
							// setSelectedLocation(loc);
							// setShowRoute(false);
						},
					}}>
					<Popup>{loc.name}</Popup>
				</Marker>
			))}

			{currentPosition && (
				<Marker
					position={currentPosition}
					icon={L.icon({
						iconUrl:
							"https://cdn-icons-png.flaticon.com/512/149/149060.png",
						iconSize: [30, 30],
						iconAnchor: [15, 30],
					})}>
					<Popup>Your Location</Popup>
				</Marker>
			)}

			<MapUpdater
				currentPosition={currentPosition}
				selectedLocation={selectedLocation}
				showRoute={showRoute}
			/>
		</MapContainer>
	);
};

export default Map;