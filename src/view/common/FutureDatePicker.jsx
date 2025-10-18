
import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const FutureDatePicker = ({ value, onChange, label, maxDate, minDate, slotProps }) => {
  return (
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        minDate={minDate || dayjs()}
		maxDate={maxDate}
		slotProps={slotProps}
      />
  );
};

export default FutureDatePicker;
