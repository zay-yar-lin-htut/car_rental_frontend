import dayjs from "dayjs";


export const calculateRentalCost = (formValues, vehicle) => {
    if (
        !formValues.pickupDate ||
        !formValues.pickupTime ||
        !formValues.dropDate ||
        !formValues.dropTime ||
        !vehicle
    ) {
        return null;
    }

    const { price_per_hour, price_per_day } = vehicle;

    const pickupDateTime = dayjs(formValues.pickupDate).hour(dayjs(formValues.pickupTime).hour()).minute(dayjs(formValues.pickupTime).minute());
    const dropDateTime = dayjs(formValues.dropDate).hour(dayjs(formValues.dropTime).hour()).minute(dayjs(formValues.dropTime).minute());

    const totalHours = dropDateTime.diff(pickupDateTime, "hour", true);

    if (totalHours <= 24) {
        const hours = Math.ceil(totalHours <= 0 ? 1 : totalHours);
        const cost = hours * price_per_hour;
        return {
            totalCost: cost,
            rentalCost: cost,
            calculationText: `${hours} hour${hours > 1 ? "s" : ""} × ${price_per_hour} MMK = ${cost} MMK`,
            breakdown: { hours, days: 0 }
        };
    } else {
        // Round up to full days - any partial day counts as a full day
        const days = Math.ceil(totalHours / 24);
        const cost = days * price_per_day;
        const breakdownText = `${days} day${days > 1 ? "s" : ""} × ${price_per_day} MMK/day = ${cost} MMK`;
        return {
            totalCost: cost,
            rentalCost: cost,
            calculationText: breakdownText,
            breakdown: { hours: totalHours % 24, days }
        };
    }
};