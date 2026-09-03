import dayjs, { Dayjs } from "dayjs";

export interface RentalFormValues {
    pickupDate?: string | Dayjs | null;
    pickupTime?: string | Dayjs | null;
    dropDate?: string | Dayjs | null;
    dropTime?: string | Dayjs | null;
    [key: string]: unknown;
}

export interface RentalVehicle {
    price_per_hour: number;
    price_per_day: number;
    [key: string]: unknown;
}

export interface RentalCostResult {
    totalCost: number;
    rentalCost: number;
    calculationText: string;
    breakdown: { hours: number; days: number };
    deliveryFee?: number;
    takebackFee?: number;
}

export const calculateRentalCost = (
    formValues: RentalFormValues,
    vehicle: RentalVehicle | null
): RentalCostResult | null => {
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

    const toDayjs = (v: string | Dayjs | null): Dayjs =>
        typeof v === "string" ? dayjs(v) : (v as Dayjs);

    const pickupDateTime = toDayjs(formValues.pickupDate as string | Dayjs)
        .hour(toDayjs(formValues.pickupTime as string | Dayjs).hour())
        .minute(toDayjs(formValues.pickupTime as string | Dayjs).minute());
    const dropDateTime = toDayjs(formValues.dropDate as string | Dayjs)
        .hour(toDayjs(formValues.dropTime as string | Dayjs).hour())
        .minute(toDayjs(formValues.dropTime as string | Dayjs).minute());

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
