import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { customTextFieldStyle } from "./customTextFieldStyle";

const FutureDatePicker = ({
	value,
	onChange,
	label,
	maxDate,
	minDate,
	slotProps,
}: DatePickerProps<boolean>) => {
	return (
		<DatePicker
			label={label}
			value={value}
			onChange={onChange}
			minDate={minDate || dayjs()}
			maxDate={maxDate}
			slotProps={{
				...slotProps,
				textField: {
					...slotProps?.textField,
					sx: customTextFieldStyle,
				},
			}}
		/>
	);
};

export default FutureDatePicker;
