import type { Request, Response } from "express";
import type {
  BookingCreatedResponseData,
  GetBookingsResponseData,
  BookingUpdatedResponseData,
  BookingDeletedResponseData,
  CustomError,
} from "../types/responseBody";
import type { CreateBookingRequestBody } from "../types/requestBody";
import { ResponseStatus, type ApiResponse } from "../types/common";
import { db } from "../db/connect";
import { bookingTable } from "../db/schema";

export const createBooking = async (
  req: Request<{}, ApiResponse<BookingCreatedResponseData> | CustomError, CreateBookingRequestBody>,
  res: Response<ApiResponse<BookingCreatedResponseData> | CustomError>
) => {
  try {
    const { carName, days, rentPerDay } = req.body;

    // Validate inputs
    if (!carName || !days || !rentPerDay || days <= 0 || rentPerDay <= 0) {
      return res.status(ResponseStatus.BAD_REQUEST).json({
        success: false,
        error: "Invalid inputs",
      });
    }

    // Get user ID from authenticated request
    const userId = (req as any).user.userId;

    const totalCost = days * rentPerDay;

    const booking = await db
      .insert(bookingTable)
      .values({
        user_id: userId,
        car_name: carName,
        days,
        rent_per_day: rentPerDay.toString(),
      })
      .returning({ id: bookingTable.id });

    return res.status(ResponseStatus.CREATED).json({
      success: true,
      data: {
        message: "Booking created successfully",
        bookingId: booking[0].id,
        totalCost,
      },
    });
  } catch (error) {
    return res.status(ResponseStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getBookings = async (
  req: Request<{}, ApiResponse<GetBookingsResponseData> | CustomError>,
  res: Response<ApiResponse<GetBookingsResponseData> | CustomError>
) => {
  // TODO: Implement get bookings logic
  return res.status(ResponseStatus.SUCCESS).json({
    success: true,
    data: [],
  });
};

export const updateBooking = async (
  req: Request<{ bookingId: string }, ApiResponse<BookingUpdatedResponseData> | CustomError>,
  res: Response<ApiResponse<BookingUpdatedResponseData> | CustomError>
) => {
  // TODO: Implement update booking logic
  const { bookingId } = req.params;
  return res.status(ResponseStatus.SUCCESS).json({
    success: true,
    data: {
      message: "Booking updated successfully",
      booking: {
        id: parseInt(bookingId),
        car_name: "Sample Car",
        days: 1,
        rent_per_day: 100,
        status: "booked",
        totalCost: 100,
      },
    },
  });
};

export const deleteBooking = async (
  req: Request<{ bookingId: string }, ApiResponse<BookingDeletedResponseData> | CustomError>,
  res: Response<ApiResponse<BookingDeletedResponseData> | CustomError>
) => {
  // TODO: Implement delete booking logic
  return res.status(ResponseStatus.SUCCESS).json({
    success: true,
    data: {
      message: "Booking deleted successfully",
    },
  });
};
