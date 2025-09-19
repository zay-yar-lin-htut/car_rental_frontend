import React from "react";
import {
	Box,
	Typography,
	TextField,
	Button,
	Paper,
	MenuItem,
	InputAdornment,
	FormControlLabel,
	Checkbox,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VideoBackground1 from "../../common/Background1";
import { useNavigate } from "react-router";
import { useIntroForm } from "../../../contexts/IntroFormProvider";

const locations = [
	{ name: "New York, NY" },
	{ name: "Los Angeles, CA" },
	{ name: "Chicago, IL" },
	{ name: "Miami, FL" },
	{ name: "Las Vegas, NV" },
];

const IntroSection = () => {
	const navigate = useNavigate();
	const { formValues, setFormValues, expanded, setExpanded } = useIntroForm();

	const handleInputChange = (e) => {
		e.preventDefault();
		const { name, value } = e.target;
		setFormValues({ ...formValues, [name]: value });

		// expand form on first interaction
		if (!expanded) setExpanded(true);
	};
	console.log("formValues", formValues);

	const handleCheckboxChange = (e) => {
		e.preventDefault();
		const checked = e.target.checked;
		setFormValues({
			...formValues,
			dropSameAsPickup: checked,
			dropoffLocation: checked ? formValues.pickupLocation : "",
		});

		if (!expanded) setExpanded(true);
	};

	const handleDateChange = (field, value) => {
		setFormValues({ ...formValues, [field]: value });
	};

	const handleTimeChange = (field, value) => {
		setFormValues({ ...formValues, [field]: value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Form submitted:", formValues);
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<Box
				sx={{
					minHeight: "100vh",
					position: "relative",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					overflow: "hidden",
					p: 2,
				}}>
				<VideoBackground1 videoSrc='/bg-2.mp4' />

				<Box sx={{ zIndex: 2, width: "100%", maxWidth: 600 }}>
					<Paper
						elevation={12}
						sx={{
							p: { xs: 3, md: 4 },
							bgcolor: "background.paper",
							borderRadius: 4,
							border: "1px solid rgba(255, 255, 255, 0.12)",
						}}>
						<Typography
							variant='h4'
							fontWeight={800}
							textAlign='center'
							gutterBottom
							sx={{ fontFamily: "'Orbitron', sans-serif", mb: 4 }}>
							Find Your Perfect Ride
						</Typography>

						<Box
							component='form'
							onSubmit={handleSubmit}
							sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
							{/* Always show pickup location */}
							<TextField
								select
								fullWidth
								label='Pickup Location'
								name='pickupLocation'
								value={formValues.pickupLocation}
								onChange={handleInputChange}
								variant='outlined'
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<LocationOnIcon />
										</InputAdornment>
									),
								}}>
								{locations.map((loc) => (
									<MenuItem
										key={loc.name}
										value={loc.name}>
										{loc.name}
									</MenuItem>
								))}
							</TextField>

							{expanded && (
								<>
									<FormControlLabel
										control={
											<Checkbox
												checked={formValues.dropSameAsPickup}
												onChange={handleCheckboxChange}
											/>
										}
										label={
											<Box
												sx={{ display: "flex", alignItems: "center", gap: 1 }}>
												Drop off at the same location
												<Typography
													component='button'
													onClick={() => {
														navigate("/our-locations");
													}}
													sx={{
														color: "primary.main",
														cursor: "pointer",
														textDecoration: "underline",
													}}>
													Our Locations
												</Typography>
											</Box>
										}
									/>

									{!formValues.dropSameAsPickup && (
										<TextField
											select
											fullWidth
											label='Dropoff Location'
											name='dropoffLocation'
											value={formValues.dropoffLocation}
											onChange={handleInputChange}
											variant='outlined'
											InputProps={{
												startAdornment: (
													<InputAdornment position='start'>
														<LocationOnIcon />
													</InputAdornment>
												),
											}}>
											{locations.map((loc) => (
												<MenuItem
													key={loc.name}
													value={loc.name}>
													{loc.name}
												</MenuItem>
											))}
										</TextField>
									)}

									<Box sx={{ display: "flex", gap: 2 }}>
										<DatePicker
											label='Pickup Date'
											value={formValues.pickupDate}
											onChange={(val) => handleDateChange("pickupDate", val)}
											slotProps={{ textField: { fullWidth: true } }}
										/>
										<TimePicker
											label='Pickup Time'
											value={formValues.pickupTime}
											onChange={(val) => handleTimeChange("pickupTime", val)}
											slotProps={{ textField: { fullWidth: true } }}
										/>
									</Box>

									<Box sx={{ display: "flex", gap: 2 }}>
										<DatePicker
											label='Drop Date'
											value={formValues.dropDate}
											onChange={(val) => handleDateChange("dropDate", val)}
											slotProps={{ textField: { fullWidth: true } }}
										/>
										<TimePicker
											label='Drop Time'
											value={formValues.dropTime}
											onChange={(val) => handleTimeChange("dropTime", val)}
											slotProps={{ textField: { fullWidth: true } }}
										/>
									</Box>

									<Button
										type='submit'
										fullWidth
										variant='contained'
										color='primary'
										size='large'
										sx={{
											py: 1.5,
											fontFamily: "'Orbitron', sans-serif",
											fontWeight: "bold",
											fontSize: "1.1rem",
										}}>
										Search
									</Button>
								</>
							)}
						</Box>
					</Paper>
				</Box>
			</Box>
		</LocalizationProvider>
	);
};

export default IntroSection;
