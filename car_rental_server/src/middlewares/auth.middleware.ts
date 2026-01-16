import type { NextFunction, Request, Response } from "express";
import { ResponseStatus } from "../types/common";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Get JWT token from cookies
  const token = req.cookies?.token;
  if (!token) {
    return res.status(ResponseStatus.UNAUTHORIZED).json({
      success: false,
      error: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    if (!decoded) {
      return res.status(ResponseStatus.UNAUTHORIZED).json({
        success: false,
        error: "Unauthorized",
      });
    }

    // Attach the user info to the request (e.g. as 'user')
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(ResponseStatus.UNAUTHORIZED).json({
      success: false,
      error: "Unauthorized",
    });
  }
};