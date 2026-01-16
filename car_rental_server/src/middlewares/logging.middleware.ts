import type { NextFunction } from "express";
import type { Request, Response } from "express";

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
};