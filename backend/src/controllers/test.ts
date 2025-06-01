import { PrismaClient } from '@prisma/client';
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const Testing= async (req:Request, res:Response) => {
    try {
      const users = await prisma.user.findMany(); 
      res.json(users);
    } catch (err) {
      console.error('Prisma connection error:', err);
      res.status(500).json({ error: 'Database connection failed' });
    }
  };