import { PrismaClient, Prisma } from "@prisma/client";
import { NextFunction, Request, RequestHandler, Response } from "express";
import dotenv from "dotenv";
import { errorhandler } from "../utils/error";
import { getUserIdFromCookie } from "../utils/helper";

dotenv.config();
const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// Create or Update Portfolio
// ─────────────────────────────────────────────────────────────────────────────
export const CreatePortfolio: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userIdInCookie = getUserIdFromCookie(req);
    const { generalInfo, socialLinks, userId } = req.body;

    // 1. Authorization check
    if (!userIdInCookie || !userId || userIdInCookie !== userId) {
      res.status(403).json({ message: "You are not authorized to perform this action." });
      return;
    }

    // 2. Required fields check
    if (
      !generalInfo.name ||
      !generalInfo.contact ||
      !generalInfo.email ||
      !generalInfo.description
    ) {
      next(errorhandler(400, "Name, Contact, Email, and Description are compulsory"));
      return;
    }

    const trimmedName = generalInfo.name.trim();
    if (trimmedName.length === 0) {
      next(errorhandler(400, "Portfolio name cannot be empty or whitespace."));
      return;
    }

    // 3. Before creating/updating: ensure *no other* portfolio already has this name
    //    (If updating, ignore the existing row owned by this same user—i.e. allow keeping your own name)
    const conflict = await prisma.userPortfolio.findFirst({
      where: {
        name: trimmedName,
        // If user already has a portfolio, we’ll ignore that same row by putting:
        // userId ≠ this user’s ID. (So if I already have a portfolio “KartikCo”,
        // I can update it to “KartikCo” again. But if someone else has “KartikCo”,
        // I cannot pick it.)
        NOT: [{ userId }],
      },
    });

    if (conflict) {
      // Someone else is already using this exact name
      res.status(400).json({ message: "This portfolio name is already taken." });
      return;
    }

    // 4. Check if there already is a portfolio for *this* user
    const existingPortfolio = await prisma.userPortfolio.findUnique({
      where: { userId },
    });

    // ──────────── If updating an existing portfolio ────────────
    if (existingPortfolio) {
      const updatedPortfolio = await prisma.userPortfolio.update({
        where: { userId },
        data: {
          portfolioQrCode: `${process.env.PORTFOLIO_DOMAIN}/portfolio/${trimmedName}`,
          name: trimmedName,
          contact: generalInfo.contact,
          email: generalInfo.email,
          description: generalInfo.description,
          area: generalInfo.address?.area || null,
          city: generalInfo.address?.city || null,
          state: generalInfo.address?.state || null,
          country: generalInfo.address?.country || null,
          postalCode: generalInfo.address?.postalCode || null,
          facebookLink: socialLinks?.facebookLink || null,
          instagramLink: socialLinks?.instagramLink || null,
          twitterLink: socialLinks?.twitterLink || null,
          youtubeLink: socialLinks?.youtubeLink || null,
          websiteLink: socialLinks?.websiteLink || null,
        },
      });
      res.status(200).json(updatedPortfolio);
      return;
    }

    // ──────────── Otherwise: create a new portfolio ────────────
    const domain = process.env.PORTFOLIO_DOMAIN || "http://localhost:5173";

    const newPortfolio = await prisma.userPortfolio.create({
      data: {
        portfolioQrCode: `${domain}/portfolio/${trimmedName}`,
        name: trimmedName,
        contact: generalInfo.contact,
        email: generalInfo.email,
        description: generalInfo.description,
        area: generalInfo.address?.area || null,
        city: generalInfo.address?.city || null,
        state: generalInfo.address?.state || null,
        country: generalInfo.address?.country || null,
        postalCode: generalInfo.address?.postalCode || null,
        facebookLink: socialLinks?.facebookLink || null,
        instagramLink: socialLinks?.instagramLink || null,
        twitterLink: socialLinks?.twitterLink || null,
        youtubeLink: socialLinks?.youtubeLink || null,
        websiteLink: socialLinks?.websiteLink || null,
        userId: userId,
      },
    });

    res.status(201).json(newPortfolio);
    return;
  } catch (error: any) {
    // 5. Catch Prisma’s unique‐constraint error (P2002) as a fallback
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // This means someone raced to create a portfolio with the same name at exactly the same moment
      res.status(400).json({ message: "This portfolio name is already taken." });
      return;
    }
    next(error);
  }
};

export const GetPortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const portfolio = await prisma.userPortfolio.findFirst({
      where: { userId },  
    });

    if (!portfolio) {
      return res.status(404).json({message: "Portfolio not found" });
    }

    res.status(200).json(portfolio);
  } catch (error) {
    next(error);
  }
};

export const Portfolio: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Pull `name` from route params
    const rawName = req.params.name;
    if (typeof rawName !== "string" || rawName.trim() === "") {
      res.status(400).json({ message: "Missing or invalid portfolio name" });
      return;
    }
    const name = rawName.trim();

    // Fetch the portfolio by `name` instead of `userId`
    const portfolio = await prisma.userPortfolio.findFirst({
      where: { name },
    });

    if (!portfolio) {
      res.status(404).json({ message: "Portfolio not found" });
        return;
    }

    res.status(200).json(portfolio);
    return;
  } catch (error) {
    next(error);
  }
};