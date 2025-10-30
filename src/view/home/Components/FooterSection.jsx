import React, { useEffect, useMemo } from "react";
import {
	Box,
	Paper,
	Typography,
	Link,
	Divider,
	Container,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
// It's a good practice to have these imports to fix potential icon issues with bundlers like Webpack
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default Leaflet icon path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: markerIcon2x,
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
});

// A small component to automatically fit the map bounds to the markers
const FitBounds = ({ bounds }) => {
	const map = useMap();
	useEffect(() => {
		if (bounds.length > 0) {
			map.fitBounds(bounds, { padding: [50, 50] });
		}
	}, [bounds, map]);
	return null;
};

const FooterSection = () => {
	const locations = useMemo(
		() => [
			{
				id: 2,
				office_name: "Yangon Office",
				latitude: 16.930086,
				longitude: 96.155242,
			},
		],
		[]
	);

	const mapBounds = useMemo(
		() => locations.map((loc) => [loc.latitude, loc.longitude]),
		{
			id: 3,
			office_name: "Naypyitaw Office",
			latitude: 19.7633,
			longitude: 96.0785,
		},
		[]
	);

	return (
		<Box // Main footer container
			component='footer'
			sx={{
				backgroundColor: "var(--background-paper)", // Dark blue background
				color: "var(--text-secondary-color)",
				py: { xs: 6, md: 8 },
			}}>
			<Container maxWidth='lg'>
				<Box
					sx={{
						display: "flex",
						flexDirection: { xs: "column", md: "row" },
						gap: { xs: 4, md: 5 },
					}}>
					{/* Column 1: Brand and About */}
					<Box sx={{ width: { xs: "100%", md: "25%" } }}>
						<Typography
							variant='h6'
							component='div'
							sx={{
								fontWeight: "bold",
								fontFamily: "'Orbitron', sans-serif",
								color: "var(--text-color)",
								mb: 2,
							}}>
							JOURNEY WHEEL
						</Typography>
						<Typography variant='body2'>
							Timeless design, contemporary interpretation. Your perfect ride is
							just a click away.
						</Typography>
						<Box sx={{ mt: 2, display: "flex", gap: 1.5 }}>
							<Link
								href='https://facebook.com'
								target='_blank'
								rel='noopener'
								color='inherit'
								aria-label='Facebook'>
								<FacebookIcon />
							</Link>
							<Link
								href='https://twitter.com'
								target='_blank'
								rel='noopener'
								color='inherit'
								aria-label='Twitter'>
								<TwitterIcon />
							</Link>
							<Link
								href='https://instagram.com'
								target='_blank'
								rel='noopener'
								color='inherit'
								aria-label='Instagram'>
								<InstagramIcon />
							</Link>
						</Box>
					</Box>

					{/* Column 2: Contact Info */}
					<Box sx={{ width: { xs: "100%", md: "25%" } }}>
						<Typography
							variant='h6'
							sx={{ fontWeight: "bold", color: "var(--text-color)", mb: 2 }}>
							Contact Us
						</Typography>
						<Box
							sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1.5 }}>
							<PhoneIcon fontSize='small' />
							<Typography variant='body2'>+95 9 123 456 789</Typography>
						</Box>
						<Box
							sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1.5 }}>
							<EmailIcon fontSize='small' />
							<Typography variant='body2'>contact@journeywheel.com</Typography>
						</Box>
						<Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
							<LocationOnIcon fontSize='small' />
							<Typography variant='body2'>
								Main Office, Yangon,
								<br />
								Myanmar
							</Typography>
						</Box>
					</Box>

					{/* Column 3: Map */}
					<Box sx={{ width: { xs: "100%", md: "50%" } }}>
						<Typography
							variant='h6'
							sx={{ fontWeight: "bold", color: "var(--text-color)", mb: 2 }}>
							Our Locations
						</Typography>
						<Paper
							elevation={4}
							sx={{
								height: 250,
								borderRadius: 2,
								overflow: "hidden", // Ensures the map corners are rounded
							}}>
							{mapBounds.length > 0 ? (
								<MapContainer
									bounds={mapBounds}
									scrollWheelZoom={false}
									style={{ height: "100%", width: "100%" }}>
									<TileLayer
										attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
										url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
									/>
									{locations.map((location) => (
										<Marker
											key={location.id}
											position={[location.latitude, location.longitude]}>
											<Popup>{location.office_name}</Popup>
										</Marker>
									))}
									<FitBounds bounds={mapBounds} />
								</MapContainer>
							) : (
								<Box
									sx={{
										height: "100%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										backgroundColor: "var(--background-color)",
									}}>
									<Typography color='var(--text-secondary-color)'>Loading map...</Typography>
								</Box>
							)}
						</Paper>
					</Box>
				</Box>

				<Divider sx={{ my: 4, borderColor: "var(--divider-color)" }} />

				<Box
					sx={{
						textAlign: "center",
					}}>
					<Typography
						variant='body2'
						color='var(--text-secondary-color)'>
						© {new Date().getFullYear()} Journey Wheel. All Rights Reserved.
					</Typography>
				</Box>
			</Container>
		</Box>
	);
};

export default FooterSection;
