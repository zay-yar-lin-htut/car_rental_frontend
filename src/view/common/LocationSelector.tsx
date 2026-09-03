import React from "react";
import { TextField, MenuItem, InputAdornment } from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import type { OfficeLocation } from "../../types";

type LocationSelectorProps = TextFieldProps & {
	locations?: OfficeLocation[];
};

const LocationSelector = ({ locations, ...props }: LocationSelectorProps) => {
	return (
		<TextField
			select
			fullWidth
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
					value={loc.location as string}>
					{loc.location_name as string}
				</MenuItem>
			))}
		</TextField>
	);
};

export default LocationSelector;
