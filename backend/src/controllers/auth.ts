import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, RequestHandler, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { errorhandler } from "../utils/error";
import dotenv from "dotenv";

dotenv.config();
const secret = process.env.JWT_SECRET_KEY;
const prisma = new PrismaClient();

export const Signup: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { username, password, phoneNumber } = req.body;

    if (!username || !password || !phoneNumber) {
      next(errorhandler(400, "all fields are required"));
      return;
    }

    phoneNumber = String(phoneNumber);

    console.log("Received signup data:", req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { mobile: phoneNumber }],
      },
    });

    if (existingUser) {
      next(errorhandler(409, "User already exists"));
      return;
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        mobile: phoneNumber,
        username,
        password: hashedPassword,
      },
    });

    const payload = {
      userId: newUser.id,
      username: newUser.username,
    };

    if (!secret) {
      throw new Error(
        "JWT_SECRET_KEY  is not defined in environment variables."
      );
    }
    const token = jwt.sign(payload, secret);
    console.log("New user created:", newUser);
    res
      .status(201)
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
      })
      .json({ id: newUser.id, username: newUser.username });
    return;
  } catch (error) {
    next(error);
  }
};

export const Login = async (req: Request, res: Response) => {
  try {
    let { username, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: username || undefined }],
      },
    });

    if (!existingUser || !existingUser.password) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      res.status(404).json({
        message: "Invalid username or password",
      });
      return;
    }

    const payload = {
      userId: existingUser.id,
      username: existingUser.username,
    };

    if (!secret) {
      throw new Error(
        "JWT_SECRET_KEY  is not defined in environment variables."
      );
    }
    const token = jwt.sign(payload, secret);

    return res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
        path: "/",
      })
      .json({ id: existingUser.id, username: existingUser.username });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const signout = async (
  req: Request,
  res: Response
) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    res
      .clearCookie("access_token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        domain: isProduction ? ".yourdomain.com" : undefined,
      })
      .status(200)
      .json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// for signup it is
// phoneNumber , username and password

// for login it is
// mobile , username and password
