import dayjs from "dayjs";

/**
 * Calculates the total rental cost based on duration and vehicle rates.
 * @param {object} formValues - The form values containing dates and vehicle info.
 * @param {Date} formValues.pickupDate - The pickup date.
 * @param {Date} formValues.pickupTime - The pickup time.
 * @param {Date} formValues.dropDate - The drop-off date.
 * @param {Date} formValues.dropTime - The drop-off time.
 * @param {object} vehicle - The vehicle object with pricing.
 * @param {number} vehicle.price_per_hour - The price per hour for the vehicle.
 * @param {number} vehicle.price_per_day - The price per day for the vehicle.
 * @returns {{totalCost: number, calculationText: string}|null} - The cost details or null if data is incomplete.
 */
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

    if (totalHours < 23) {
        const hours = Math.ceil(totalHours <= 0 ? 1 : totalHours);
        return { totalCost: hours * price_per_hour, calculationText: `${hours} hour${hours > 1 ? "s" : ""} at MMK ${price_per_hour}/hour` };
    } else {
        const days = Math.ceil(totalHours / 24);
        return { totalCost: days * price_per_day, calculationText: `${days} day${days > 1 ? "s" : ""} at MMK ${price_per_day}/day` };
    }
};