/**
 * Shared domain types for the Journey Wheel frontend.
 * These mirror the response shapes returned by the Laravel backend.
 */

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    token?: string;
    user?: User;
}

export interface User {
    user_id: string;
    user_type_id?: number | string;
    name?: string;
    email?: string;
    phone?: string;
    photo_path_id?: number | null;
    is_banned?: boolean | number;
    profile_photo?: string | null;
    [key: string]: unknown;
}

export interface CarType {
    car_type_id: number;
    type_name?: string;
    price_per_hour?: number;
    price_per_day?: number;
    [key: string]: unknown;
}

export interface Car {
    car_id: number;
    car_type_id?: number | null;
    model?: string;
    color?: string;
    license_plate?: string;
    price_per_hour?: number;
    price_per_day?: number;
    number_of_seats?: number;
    luggage_capacity?: number;
    transmission?: string;
    fuel_type?: string;
    availability?: boolean | number;
    photo_path_id?: number | null;
    office_location_id?: number | null;
    car_type?: CarType | null;
    [key: string]: unknown;
}

export interface Booking {
    booking_id: number;
    user_id?: number;
    car_id?: number;
    office_location_id?: number | null;
    booking_status?: string;
    ticket_number?: string;
    pickup_datetime?: string;
    dropoff_datetime?: string;
    total_amount?: number;
    [key: string]: unknown;
}

export interface OfficeLocation {
    office_location_id: number;
    location_name?: string;
    latitude?: number | string;
    longitude?: number | string;
    [key: string]: unknown;
}

export interface Review {
    review_id: number;
    user_id?: number;
    booking_id?: number;
    rating?: number;
    comment?: string;
    [key: string]: unknown;
}

export interface ContactMessage {
    contact_us_id: number;
    email?: string;
    title?: string;
    description?: string;
    resolved?: boolean | number;
    [key: string]: unknown;
}
