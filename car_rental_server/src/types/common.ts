export const ResponseStatus = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  USER_ALREADY_EXISTS: 409,
} as const;

export type ResponseStatus = typeof ResponseStatus[keyof typeof ResponseStatus];

export type JwtPayload = {
  id: number;
  username: string;
};

export type AuthMiddleware = {
  id: number;
  username: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type BookingStatus = "booked" | "confirmed" | "cancelled";
