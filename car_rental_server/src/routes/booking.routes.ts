import { Router } from "express";
import {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking,
} from "../handlers/booking.handlers";

const router = Router();

router.post("/", createBooking);
router.get("/", getBookings);
router.put("/:bookingId", updateBooking);
router.delete("/:bookingId", deleteBooking);

export default router;
