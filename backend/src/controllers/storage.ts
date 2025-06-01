// storageStatusHandler.ts
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export default async function StorageStatusHandler(req: Request, res: Response) {
  const eventId = String(req.query.eventId);
  if (!eventId) {
    return res.status(400).json({ error: "Missing eventId" });
  }

  try {
    // Get event with user relationship
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        user: {
          select: {
            storageUsed: true,
            totalStorageAllowed: true
          }
        }
      }
    });

    if (!event) return res.status(404).json({ error: "Event not found" });
    if (!event.user) return res.status(404).json({ error: "User not found" });

    // Convert BigInt values to strings
    res.json({
      used: event.user.storageUsed.toString(),
      total: event.user.totalStorageAllowed.toString(),
      remaining: (event.user.totalStorageAllowed - event.user.storageUsed).toString()
    });

  } catch (error) {
    console.error("Storage endpoint error:", error);
    res.status(500).json({ 
      error: "Failed to fetch storage data",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}










export async function storagedashboardupdate(
  req: Request,
  res: Response
) {
  const userId = req.params.userId as string;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        storageUsed: true,
        totalStorageAllowed: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate remaining storage
    const remaining = user.totalStorageAllowed - user.storageUsed;

    res.status(200).json({
      used: user.storageUsed.toString(),
      total: user.totalStorageAllowed.toString(),
      remaining: remaining.toString(),
    });
  } catch (error) {
    console.error("Error fetching storage data:", error);
    res.status(500).json({ error: "Failed to fetch storage data" });
  }
}