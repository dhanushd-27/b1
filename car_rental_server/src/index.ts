import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.listen(3000, () => {
  console.log(`Server is running on port, host: http://localhost:3000`);
});