import type { BookingStatus } from "./common";

export type CustomError = {
  success: false;
  error: string;
};

export type UserCreatedResponseData = {
  message: string;
  userId: number;
};

export type LoginSuccessResponseData = {
  message: string;
  token: string;
};

export type BookingCreatedResponseData = {
  message: string;
  bookingId: number;
  totalCost: number;
};

export type BookingItem = {
  id: number;
  car_name: string;
  days: number;
  rent_per_day: number;
  status: BookingStatus;
  totalCost: number;
};

export type GetBookingsResponseData = BookingItem[];

export type BookingSummaryResponseData = {
  userId: number;
  username: string;
  totalBookings: number;
  totalAmountSpent: number;
};

export type BookingUpdatedResponseData = {
  message: string;
  booking: BookingItem;
};

export type BookingDeletedResponseData = {
  message: string;
};
