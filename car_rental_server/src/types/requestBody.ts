export type SignUpRequestBody = {
  username: string;
  password: string;
};

export type SignInRequestBody = {
  username: string;
  password: string;
};

export type CreateBookingRequestBody = {
  carName: string;
  days: number;
  rentPerDay: number;
};

import type { BookingStatus } from "./common";

export type UpdateBookingRequestBody = {
  carName?: string;
  days?: number;
  rentPerDay?: number;
  status?: BookingStatus;
};
