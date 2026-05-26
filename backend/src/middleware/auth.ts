import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.JWT_SECRET_KEY;
export const validateUserMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Allow preflight requests
  if (req.method === "OPTIONS") {
    return next();
  }

  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No token provided",
    });
  }

  try {
    if (!secret) {
      throw new Error(
        "JWT_SECRET_KEY is not defined in environment variables."
      );
    }

    const decoded = jwt.verify(token, secret);

    //@ts-ignore
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid token",
    });
  }
};
