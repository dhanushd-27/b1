import "dotenv/config";
import express from "express";
import { loggingMiddleware } from "./middlewares/logging.middleware";
import cors, { type CorsOptions } from "cors";
import userRoutes from "./routes/user.routes";

const corsOptions: CorsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();

app.use(express.json());
app.use(loggingMiddleware);
app.use(cors(corsOptions));

app.use("/api/v1/users", userRoutes);

app.listen(3000, () => {
  console.log(`Server is running on port, host: http://localhost:3000`);
});