import React from "react";
import { TextField, MenuItem, InputAdornment } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { customTextFieldStyle } from "./customTextFieldStyle";

const LocationSelector = ({
	locations,
	label,
	name,
	value,
	onChange,
	...props
}) => {
	return (
		<TextField
			select
			fullWidth
			label={label}
			name={name}
			value={value}
			onChange={onChange}
			variant='outlined'
			InputProps={{
				startAdornment: (
					<InputAdornment position='start'>
						<LocationOnIcon />
					</InputAdornment>
				),
			}}
			{...props}>
			{locations?.map((loc) => (
				<MenuItem
					key={loc.office_location_id}
					value={loc.location}>
					{loc.location_name}
				</MenuItem>
			))}
		</TextField>
	);
};

export default LocationSelector;
