import React, { useEffect } from "react";
import {
	Box,
	Typography,
	TextField,
	Button,
	Paper,
	FormControlLabel,
	Checkbox,
	CircularProgress,
} from "@mui/material";

import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import VideoBackground1 from "../../common/background1";
import { useNavigate } from "react-router";
import { useIntroForm } from "../../../contexts/IntroFormProvider";
import LocationSelector from "../../common/LocationSelector";
import FutureDatePicker from "../../common/FutureDatePicker";
import dayjs from "dayjs";
import { createDataServices } from "../../../services/DataServices";
import { useSnackbar } from "../../../contexts/ErrorMessage";
import { API_ENDPOINTS } from "../../../services/Configuration";

const IntroSection = () => {
	const dataServices = createDataServices();
	const { showSnackbar } = useSnackbar();
	const navigate = useNavigate();
	const [locations, setLocations] = React.useState([]);
	const [errors, setErrors] = React.useState({});
	const {
		formValues,
		setFormValues,
		expanded,
		setExpanded,
		isLoading,
		setIsLoading,
	} = useIntroForm();

	useEffect(() => {
		const getOfficeLocation = async () => {
			setIsLoading(true);
			try {
				const response = await dataServices.retrieve(
					API_ENDPOINTS.location.base,
					API_ENDPOINTS.location.getOffice
				);

				setLocations(response.data);
			} catch (error) {
			} finally {
				setIsLoading(false);
			}
		};

		getOfficeLocation();
	}, []);

	const handleInputChange = (e) => {
		e.preventDefault();
		const { name, value } = e.target;

		// Find the full location object from the selected location name
		const selectedLocation = locations.find(
			(loc) => String(loc.location) === String(value)
		);

		const newFormValues = { ...formValues, [name]: selectedLocation };

		if (name === "pickupLocation" && newFormValues.dropSameAsPickup) {
			newFormValues.dropoffLocation = selectedLocation;
		}

		setFormValues(newFormValues);

		if (!expanded) setExpanded(true);
	};

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

	const handleTimeError = (field, error) => {
		setErrors((prev) => ({ ...prev, [field]: error }));
	};

	const getValidationMessage = () => {
		if (!formValues.pickupLocation) return "Please select a pickup location.";
		if (!formValues.dropoffLocation)
			return "Please select a drop-off location.";
		if (!formValues.pickupDate) return "Please select a pickup date.";
		if (!formValues.dropDate) return "Please select a drop-off date.";
		if (!formValues.pickupTime) return "Please select a pickup time.";
		if (errors.pickupTime) {
			if (errors.pickupTime === "minTime")
				return "Pickup time cannot be in the past.";
			return "Invalid pickup time.";
		}
		if (!formValues.dropTime) return "Please select a drop-off time.";
		if (errors.dropTime) {
			if (errors.dropTime === "minTime")
				return "Drop-off time must be at least 1 hour after pickup.";
			return "Invalid drop-off time.";
		}
		return null;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const validationMessage = getValidationMessage();
		if (validationMessage) {
			showSnackbar(validationMessage, "error");
			return;
		}

		const updatedFormValues = { ...formValues };
		if (!updatedFormValues.pickupTime) {
			updatedFormValues.pickupTime = dayjs().startOf("day");
		}
		if (!updatedFormValues.dropTime) {
			updatedFormValues.dropTime = dayjs().endOf("day");
		}
		setFormValues(updatedFormValues);
		setIsLoading(true);
		navigate("/ride");
	};

	// Determine the minimum pickup time. If the selected date is today,
	// it must be at least 1 hour from the current time.
	const minPickupTime = formValues.pickupDate?.isSame(dayjs(), "day") // If it's today
		? dayjs().add(20, "minutes") // Set min time to 20 minutes from now
		: undefined;

	// Determine the minimum drop-off time. If the dates are the same,
	// it must be at least 1 hour after the pickup time.
	const minDropTime =
		formValues.pickupDate &&
		formValues.dropDate &&
		dayjs(formValues.pickupDate).isSame(formValues.dropDate, "day") &&
		formValues.pickupTime
			? dayjs(formValues.pickupTime).add(1, "hour")
			: undefined;
	return (
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
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: 3,
						}}>
						{isLoading && locations.length === 0 ? (
							<TextField
								label='Loading Locations...'
								variant='outlined'
								disabled
								fullWidth
								sx={{ color: "white" }}
								InputProps={{
									endAdornment: (
										<CircularProgress
											color='white'
											size={20}
										/>
									),
								}}
							/>
						) : (
							<LocationSelector
								label='Pickup Location'
								name='pickupLocation'
								value={formValues.pickupLocation?.location || ""}
								onChange={handleInputChange}
								locations={locations}
							/>
						)}

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
										<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
									<LocationSelector
										label='Dropoff Location'
										name='dropoffLocation'
										value={formValues.dropoffLocation?.location || ""}
										onChange={handleInputChange}
										locations={locations}
									/>
								)}

								<Box sx={{ display: "flex", gap: 2 }}>
									<FutureDatePicker
										label='Pickup Date'
										value={formValues.pickupDate}
										onChange={(val) => handleDateChange("pickupDate", val)}
										maxDate={formValues.dropDate}
										slotProps={{ textField: { fullWidth: true } }}
									/>
									<TimePicker
										label='Pickup Time'
										value={formValues.pickupTime}
										onChange={(val) => handleTimeChange("pickupTime", val)}
										minTime={minPickupTime}
										onError={(error) => handleTimeError("pickupTime", error)}
										slotProps={{ textField: { fullWidth: true } }}
									/>
								</Box>

								<Box sx={{ display: "flex", gap: 2 }}>
									<FutureDatePicker
										label='Drop Date'
										value={formValues.dropDate}
										onChange={(val) => handleDateChange("dropDate", val)}
										minDate={formValues.pickupDate}
										slotProps={{ textField: { fullWidth: true } }}
									/>
									<TimePicker
										label='Drop Time'
										value={formValues.dropTime}
										onChange={(val) => handleTimeChange("dropTime", val)}
										minTime={minDropTime}
										onError={(error) => handleTimeError("dropTime", error)}
										slotProps={{ textField: { fullWidth: true } }}
									/>
								</Box>

								<Button
									type='submit'
									fullWidth
									variant='contained'
									color='primary'
									size='large'
									disabled={isLoading}
									sx={{
										py: 1.5,
										fontFamily: "'Orbitron', sans-serif",
										fontWeight: "bold",
										fontSize: "1.1rem",
									}}>
									{isLoading ? "Searching..." : "Search"}
								</Button>
							</>
						)}
					</Box>
				</Paper>
			</Box>
		</Box>
	);
};

export default IntroSection;
