import React, { useEffect, useMemo } from "react";
import {
	Button,
	Box,
	Paper,
	Typography,
	Link,
	Divider,
	Container,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";

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
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: markerIcon2x,
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
});

// A small component to automatically fit the map bounds to the markers
const FitBounds = ({ bounds }: { bounds: LatLngBoundsExpression }) => {
	const map = useMap();
	useEffect(() => {
		if ((bounds as LatLngTuple[]).length > 0) {
			map.fitBounds(bounds, { padding: [50, 50] });
		}
	}, [bounds, map]);
	return null;
};

const FooterSection = React.forwardRef((props, ref) => {
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

	const mapBounds = useMemo<LatLngTuple[]>(
		() => locations.map((loc) => [loc.latitude, loc.longitude] as LatLngTuple),
		[locations]
	);

  return (
		<Box // Main footer container
			ref={ref}
			component='footer'
			sx={{
				background: "linear-gradient(135deg, var(--background-paper) 0%, rgba(0,0,0,0.1) 100%)",
				color: "var(--text-secondary-color)",
				py: { xs: 6, md: 8 },
			}}>
			<Container
				maxWidth='lg'
				sx={{
					display: 'grid',
					gridTemplateColumns: { xs: '1fr', md: '25% 25% 25% 25%' },
					gridTemplateRows: 'auto auto',
					gap: { xs: 4, md: 5 },
				}}>
				{/* Column 1: Brand and About */}
				<Box sx={{ gridColumn: { xs: 1, md: 1 }, gridRow: { xs: 1, md: 1 } }}>
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
				</Box>

				{/* Column 2: Quick Links */}
				<Box sx={{ gridColumn: { xs: 1, md: 2 }, gridRow: { xs: 2, md: 1 } }}>
					<Typography
						variant='h6'
						sx={{ fontWeight: "bold", color: "var(--text-color)", mb: 2 }}>
						Quick Links
					</Typography>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
						<Link href="/" color="inherit" sx={{ textDecoration: "none", "&:hover": { color: "var(--primary-color)" } }}>
							<Typography variant='body2'>Home</Typography>
						</Link>
						<Link href="/user-profile" color="inherit" sx={{ textDecoration: "none", "&:hover": { color: "var(--primary-color)" } }}>
							<Typography variant='body2'>Profile</Typography>
						</Link>
						<Link href="/history" color="inherit" sx={{ textDecoration: "none", "&:hover": { color: "var(--primary-color)" } }}>
							<Typography variant='body2'>History</Typography>
						</Link>
					</Box>
				</Box>

				{/* Column 3: Contact Info */}
				<Box sx={{ gridColumn: { xs: 1, md: 3 }, gridRow: { xs: 3, md: 1 } }}>
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

				{/* Column 4: Map */}
				<Box sx={{ gridColumn: { xs: 1, md: 4 }, gridRow: { xs: 4, md: '1 / 3' } }}>
					<Typography
						variant='h6'
						sx={{ fontWeight: "bold", color: "var(--text-color)", mb: 2 }}>
						Our Locations
					</Typography>
					<Paper
						elevation={4}
						sx={{
							height: 300, // Increased height since it spans two rows
							borderRadius: 2,
							overflow: "hidden",
						}}>
						{mapBounds.length > 0 ? (
							<MapContainer
								bounds={mapBounds}
								scrollWheelZoom={false}
								style={{ height: "100%", width: "100%", zIndex: 0 }}>
								<TileLayer
									attribution='&copy; <a href="https://www.tomtom.com">TomTom</a>'
									url={`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${import.meta.env.VITE_TOMTOM_KEY}`}
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

				{/* Column 1 Row 2: Facebook and Instagram */}
				<Box sx={{ gridColumn: { xs: 1, md: 1 }, gridRow: { xs: 5, md: 2 }, display: "flex", flexDirection: "column", gap: 1 }}>
					<Button
						variant='contained'
						sx={{
							flex: 1,
							minHeight: 40,
							bgcolor: "#1877F2",
							color: "white",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							py: 0.5,
							"&:hover": { bgcolor: "#166FE5" },
						}}
						component={Link}
						href='https://facebook.com'
						target='_blank'
						rel='noopener'>
						<FacebookIcon sx={{ fontSize: '1.2rem', mb: 0.25 }} />
						<Typography variant='caption' sx={{ fontWeight: 'bold', fontSize: '0.6rem' }}>Facebook</Typography>
					</Button>
					<Button
						variant='contained'
						sx={{
							flex: 1,
							minHeight: 40,
							background: "linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
							color: "white",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							py: 0.5,
							"&:hover": { opacity: 0.9 },
						}}
						component={Link}
						href='https://instagram.com'
						target='_blank'
						rel='noopener'>
						<InstagramIcon sx={{ fontSize: '1.2rem', mb: 0.25 }} />
						<Typography variant='caption' sx={{ fontWeight: 'bold', fontSize: '0.6rem' }}>Instagram</Typography>
					</Button>
				</Box>

				{/* Column 2 Row 2: Twitter and LinkedIn */}
				<Box sx={{ gridColumn: { xs: 1, md: 2 }, gridRow: { xs: 6, md: 2 }, display: "flex", flexDirection: "column", gap: 1 }}>
					<Button
						variant='contained'
						sx={{
							flex: 1,
							minHeight: 40,
							bgcolor: "#1DA1F2",
							color: "white",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							py: 0.5,
							"&:hover": { bgcolor: "#1A91DA" },
						}}
						component={Link}
						href='https://twitter.com'
						target='_blank'
						rel='noopener'>
						<TwitterIcon sx={{ fontSize: '1.2rem', mb: 0.25 }} />
						<Typography variant='caption' sx={{ fontWeight: 'bold', fontSize: '0.6rem' }}>Twitter</Typography>
					</Button>
					<Button
						variant='contained'
						sx={{
							flex: 1,
							minHeight: 40,
							bgcolor: "#0077B5",
							color: "white",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							py: 0.5,
							"&:hover": { bgcolor: "#005885" },
						}}
						component={Link}
						href='https://linkedin.com'
						target='_blank'
						rel='noopener'>
						<Typography variant='h6' sx={{ mb: 0.25, fontSize: '0.8rem' }}>in</Typography>
						<Typography variant='caption' sx={{ fontWeight: 'bold', fontSize: '0.6rem' }}>LinkedIn</Typography>
					</Button>
				</Box>

				{/* Column 3 Row 2: YouTube and TikTok */}
				<Box sx={{ gridColumn: { xs: 1, md: 3 }, gridRow: { xs: 7, md: 2 }, display: "flex", flexDirection: "column", gap: 1 }}>
					<Button
						variant='contained'
						sx={{
							flex: 1,
							minHeight: 10,
							bgcolor: "#FF0000",
							color: "white",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							py: 1,
							"&:hover": { bgcolor: "#CC0000" },
						}}
						component={Link}
						href='https://youtube.com'
						target='_blank'
						rel='noopener'>
						<Typography variant='h6' sx={{ mb: 0.25, fontSize: '0.8rem' }}>▶</Typography>
						<Typography variant='caption' sx={{ fontWeight: 'bold', fontSize: '0.6rem' }}>YouTube</Typography>
					</Button>
					<Button
						variant='contained'
						sx={{
							flex: 1,
							minHeight: 10,
							bgcolor: "#000000",
							color: "white",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							py: 0.5,
							"&:hover": { bgcolor: "#333333" },
						}}
						component={Link}
						href='https://tiktok.com'
						target='_blank'
						rel='noopener'>
						<Typography variant='h6' sx={{ mb: 0.25, fontSize: '0.8rem' }}>🎵</Typography>
						<Typography variant='caption' sx={{ fontWeight: 'bold', fontSize: '0.6rem' }}>TikTok</Typography>
					</Button>
				</Box>
			</Container>



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
		</Box>
	);
});

export default FooterSection;
