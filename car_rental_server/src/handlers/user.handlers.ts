import type { Request, Response } from "express";
import type { SignUpRequestBody, SignInRequestBody } from "../types/requestBody";
import type {
  UserCreatedResponseData,
  LoginSuccessResponseData,
  CustomError,
} from "../types/responseBody";
import { ResponseStatus, type ApiResponse } from "../types/common";
import { eq } from "drizzle-orm";
import { db } from "../db/connect";
import { userTable } from "../db/schema";
import bcrypt from "bcrypt";


export const signUp = async (
  req: Request<{}, ApiResponse<UserCreatedResponseData> | CustomError, SignUpRequestBody>,
  res: Response<ApiResponse<UserCreatedResponseData> | CustomError>
) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(ResponseStatus.BAD_REQUEST).json({
        success: false,
        error: "Invalid Request Body",
      });
    }

    // Check if user already exists
    const existingUser = await db.select().from(userTable).where(eq(userTable.username, username))


    if (existingUser.length > 0) {
      return res.status(ResponseStatus.BAD_REQUEST).json({
        success: false,
        error: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await db.insert(userTable).values({ username, password: hashedPassword }).returning({ id: userTable.id });

    return res.status(ResponseStatus.CREATED).json({
      success: true,
      data: {
        message: "User created successfully",
        userId: user[0].id,
      },
    });
  } catch (error) {
    return res.status(ResponseStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Internal server error",
    });
  }
};

import jwt from "jsonwebtoken";

export const signIn = async (
  req: Request<{}, ApiResponse<LoginSuccessResponseData> | CustomError, SignInRequestBody>,
  res: Response<ApiResponse<LoginSuccessResponseData> | CustomError>
) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(ResponseStatus.BAD_REQUEST).json({
        success: false,
        error: "Username and password are required",
      });
    }

    // Check if user exists
    const user = await db.select().from(userTable).where(eq(userTable.username, username));
    if (!user || user.length === 0) {
      return res.status(ResponseStatus.UNAUTHORIZED).json({
        success: false,
        error: "Invalid Username",
      });
    }

    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      return res.status(ResponseStatus.UNAUTHORIZED).json({
        success: false,
        error: "Incorrect Password",
      });
    }

    // Get JWT secret from environment
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(ResponseStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: "Internal server error: JWT secret is not set",
      });
    }

    // Create JWT token
    const payload = { userId: user[0].id, username: user[0].username };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });

    return res.status(ResponseStatus.SUCCESS).json({
      success: true,
      data: {
        message: "Login successful",
        token
      },
    });
  } catch (error) {
    return res.status(ResponseStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Internal server error",
    });
  }
};