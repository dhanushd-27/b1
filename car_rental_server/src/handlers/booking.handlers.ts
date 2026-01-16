import type { Request, Response } from "express";
import type {
  BookingCreatedResponseData,
  GetBookingsResponseData,
  BookingUpdatedResponseData,
  BookingDeletedResponseData,
  BookingSummaryResponseData,
  CustomError,
} from "../types/responseBody";
import type { CreateBookingRequestBody, UpdateBookingRequestBody } from "../types/requestBody";
import { ResponseStatus, type ApiResponse } from "../types/common";
import { db } from "../db/connect";
import { bookingTable, userTable } from "../db/schema";
import { eq, and, inArray } from "drizzle-orm";

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
  req: Request<{}, ApiResponse<GetBookingsResponseData | BookingSummaryResponseData> | CustomError>,
  res: Response<ApiResponse<GetBookingsResponseData | BookingSummaryResponseData> | CustomError>
) => {
  try {
    const userId = (req as any).user.userId;
    const username = (req as any).user.username;
    const { bookingId, summary } = req.query;

    // If summary=true, return booking summary
    if (summary === "true") {
      const bookings = await db
        .select()
        .from(bookingTable)
        .where(
          and(
            eq(bookingTable.user_id, userId),
            inArray(bookingTable.status, ["booked", "confirmed"])
          )
        );

      const totalBookings = bookings.length;
      const totalAmountSpent = bookings.reduce((sum, booking) => {
        return sum + booking.days * parseFloat(booking.rent_per_day);
      }, 0);

      return res.status(ResponseStatus.SUCCESS).json({
        success: true,
        data: {
          userId,
          username,
          totalBookings,
          totalAmountSpent,
        },
      });
    }

    // If bookingId is provided, fetch single booking
    if (bookingId) {
      const booking = await db
        .select()
        .from(bookingTable)
        .where(
          and(
            eq(bookingTable.id, parseInt(bookingId as string)),
            eq(bookingTable.user_id, userId)
          )
        );

      if (booking.length === 0) {
        return res.status(ResponseStatus.NOT_FOUND).json({
          success: false,
          error: "Booking not found",
        });
      }

      const bookingData = booking[0];
      return res.status(ResponseStatus.SUCCESS).json({
        success: true,
        data: [
          {
            id: bookingData.id,
            car_name: bookingData.car_name,
            days: bookingData.days,
            rent_per_day: parseFloat(bookingData.rent_per_day),
            status: bookingData.status,
            totalCost: bookingData.days * parseFloat(bookingData.rent_per_day),
          },
        ],
      });
    }

    // Fetch all bookings for the user
    const bookings = await db
      .select()
      .from(bookingTable)
      .where(eq(bookingTable.user_id, userId));

    const bookingsData = bookings.map((booking) => ({
      id: booking.id,
      car_name: booking.car_name,
      days: booking.days,
      rent_per_day: parseFloat(booking.rent_per_day),
      status: booking.status,
      totalCost: booking.days * parseFloat(booking.rent_per_day),
    }));

    return res.status(ResponseStatus.SUCCESS).json({
      success: true,
      data: bookingsData,
    });
  } catch (error) {
    return res.status(ResponseStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const updateBooking = async (
  req: Request<{ bookingId: string }, ApiResponse<BookingUpdatedResponseData> | CustomError, UpdateBookingRequestBody>,
  res: Response<ApiResponse<BookingUpdatedResponseData> | CustomError>
) => {
  try {
    const userId = (req as any).user.userId;
    const { bookingId } = req.params;
    const { carName, days, rentPerDay, status } = req.body;

    // Validate at least one field is provided
    if (!carName && !days && !rentPerDay && !status) {
      return res.status(ResponseStatus.BAD_REQUEST).json({
        success: false,
        error: "Invalid inputs",
      });
    }

    // Validate numeric inputs if provided
    if ((days !== undefined && days <= 0) || (rentPerDay !== undefined && rentPerDay <= 0)) {
      return res.status(ResponseStatus.BAD_REQUEST).json({
        success: false,
        error: "Invalid inputs",
      });
    }

    // Validate status if provided
    const validStatuses = ["booked", "confirmed", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(ResponseStatus.BAD_REQUEST).json({
        success: false,
        error: "Invalid inputs",
      });
    }

    // Check if booking exists
    const existingBooking = await db
      .select()
      .from(bookingTable)
      .where(eq(bookingTable.id, parseInt(bookingId)));

    if (existingBooking.length === 0) {
      return res.status(ResponseStatus.NOT_FOUND).json({
        success: false,
        error: "Booking not found",
      });
    }

    // Check if booking belongs to user
    if (existingBooking[0].user_id !== userId) {
      return res.status(ResponseStatus.FORBIDDEN).json({
        success: false,
        error: "Booking does not belong to user",
      });
    }

    // Build update object
    const updateData: Partial<{
      car_name: string;
      days: number;
      rent_per_day: string;
      status: "booked" | "confirmed" | "cancelled";
    }> = {};

    if (carName) updateData.car_name = carName;
    if (days) updateData.days = days;
    if (rentPerDay) updateData.rent_per_day = rentPerDay.toString();
    if (status) updateData.status = status;

    // Update booking
    const updatedBooking = await db
      .update(bookingTable)
      .set(updateData)
      .where(eq(bookingTable.id, parseInt(bookingId)))
      .returning();

    const booking = updatedBooking[0];
    const totalCost = booking.days * parseFloat(booking.rent_per_day);

    return res.status(ResponseStatus.SUCCESS).json({
      success: true,
      data: {
        message: "Booking updated successfully",
        booking: {
          id: booking.id,
          car_name: booking.car_name,
          days: booking.days,
          rent_per_day: parseFloat(booking.rent_per_day),
          status: booking.status,
          totalCost,
        },
      },
    });
  } catch (error) {
    return res.status(ResponseStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const deleteBooking = async (
  req: Request<{ bookingId: string }, ApiResponse<BookingDeletedResponseData> | CustomError>,
  res: Response<ApiResponse<BookingDeletedResponseData> | CustomError>
) => {
  try {
    const userId = (req as any).user.userId;
    const { bookingId } = req.params;

    // Check if booking exists
    const existingBooking = await db
      .select()
      .from(bookingTable)
      .where(eq(bookingTable.id, parseInt(bookingId)));

    if (existingBooking.length === 0) {
      return res.status(ResponseStatus.NOT_FOUND).json({
        success: false,
        error: "Booking not found",
      });
    }

    // Check if booking belongs to user
    if (existingBooking[0].user_id !== userId) {
      return res.status(ResponseStatus.FORBIDDEN).json({
        success: false,
        error: "Booking does not belong to user",
      });
    }

    // Delete booking
    await db
      .delete(bookingTable)
      .where(eq(bookingTable.id, parseInt(bookingId)));

    return res.status(ResponseStatus.SUCCESS).json({
      success: true,
      data: {
        message: "Booking deleted successfully",
      },
    });
  } catch (error) {
    return res.status(ResponseStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Internal server error",
    });
  }
};
