import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { loggingMiddleware } from "./middlewares/logging.middleware";
import { authMiddleware } from "./middlewares/auth.middleware";
import cors, { type CorsOptions } from "cors";
import userRoutes from "./routes/user.routes";
import bookingRoutes from "./routes/booking.routes";

const corsOptions: CorsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(loggingMiddleware);
app.use(cors(corsOptions));

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/bookings", authMiddleware, bookingRoutes);

app.listen(3000, () => {
  console.log(`Server is running on port, host: http://localhost:3000`);
});