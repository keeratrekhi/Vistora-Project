import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const HealthCheck: RequestHandler = async (_, res) => {
  try {
    // lightweight check—no disconnect!
    await prisma.$queryRaw`SELECT 1;`;
    res.status(200).json({ status: 'OK', message: 'Service is healthy' });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({ status: 'ERROR', message: 'Service is unhealthy' });
  }
};