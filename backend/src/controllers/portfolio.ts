import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, RequestHandler, Response } from "express";
import dotenv from "dotenv";
import { errorhandler } from "../utils/error";
import { getUserIdFromCookie } from "../utils/helper";

dotenv.config();

const prisma = new PrismaClient();

export const CreatePortfolio: RequestHandler = async (req: Request, res: Response , next:NextFunction): Promise<void> => {
  try {
    const userIdInCookie = getUserIdFromCookie(req);
    const { generalInfo, socialLinks, userId } = req.body;
    if(!userIdInCookie || !userId || userIdInCookie !== userId){
      res.status(403).json({ message: "You are not authorized to get this event" });
      return;
    }

    if (!generalInfo.name || !generalInfo.contact || !generalInfo.email || !generalInfo.description){
       next(errorhandler(400,"Name, Contact, Email, and Description are compulsory"));  
       return;
    }

    const existingPortfolio = await prisma.userPortfolio.findFirst({
      where: { userId : userId }
    });

    if (existingPortfolio) {
        const updatedPortfolio = await prisma.userPortfolio.update({
          where: { userId: userId },
          data: {
            portfolioQrCode: `${process.env.PORTFOLIO_DOMAIN}/portfolio/${userId}`,
            name: generalInfo.name || existingPortfolio.name,
            contact: generalInfo.contact || existingPortfolio.contact,
            email: generalInfo.email || existingPortfolio.email,
            description: generalInfo.description || existingPortfolio.description,
            area: generalInfo.address?.area || existingPortfolio.area,
            city: generalInfo.address?.city || existingPortfolio.city,
            state: generalInfo.address?.state || existingPortfolio.state,
            country: generalInfo.address?.country || existingPortfolio.country,
            postalCode: generalInfo.address?.postalCode || existingPortfolio.postalCode,
            facebookLink: socialLinks?.facebookLink || existingPortfolio.facebookLink,
            instagramLink: socialLinks?.instagramLink || existingPortfolio.instagramLink,
            twitterLink: socialLinks?.twitterLink || existingPortfolio.twitterLink,
            youtubeLink: socialLinks?.youtubeLink || existingPortfolio.youtubeLink,
            websiteLink: socialLinks?.websiteLink || existingPortfolio.websiteLink,
          }
        });
        res.status(200).json({updatedPortfolio});
        return;
    }
    const domain = process.env.PORTFOLIO_DOMAIN || "http://localhost:8080";

    const newPortfolio = await prisma.userPortfolio.create({
      data: {
        portfolioQrCode: `${domain}/portfolio/${userId}`,
        name: generalInfo.name,
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
        userId:userId,
      }
    });

    res.status(201).json(newPortfolio);

  } catch (error) {
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