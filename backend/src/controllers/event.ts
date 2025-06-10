import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromCookie } from "../utils/helper";

const prisma = new PrismaClient();


export const CreateEvent: RequestHandler = async (req, res) => {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    const {
      title,
      description,
      eventDate,    // may be undefined or invalid
      location,
      coverImage,
      pin,          // string or null/undefined
    } = req.body as {
      title: string;
      description?: string;
      eventDate?: string;
      location?: string;
      coverImage?: string;
      pin?: string | null;
    };

    // 1. Parse eventDate, fallback to now if missing/invalid
    let dateObj = eventDate ? new Date(eventDate) : new Date();
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date();
    }

    // 2. Parse PIN only if exactly 4 digits, else null
    const finalPin: number | null =
      typeof pin === "string" && /^\d{4}$/.test(pin)
        ? Number(pin)
        : null;

    const created = await prisma.event.create({
      data: {
        title,
        description:       description ?? "",
        eventDate:         dateObj,
        publishedDateTime: new Date(),
        location:          location ?? "",
        coverImageUrl:     coverImage ?? "",
        pin:               finalPin,
        userId,
      },
    });

    res.status(200).json({
      message: "Event created",
      eventId: created.id,
      pin:      finalPin,  // echo what was stored
    });
    return;
  } catch (err) {
    console.error("[CreateEvent]", err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const GetEvents: RequestHandler = async (req, res) => {
  try {
    const userId = getUserIdFromCookie(req);
    if(!userId){
      res.status(403).json({ message: "You are not authorized to get this event" });
      return;
    }
    const events = await prisma.event.findMany({
      where: {
        userId: userId,
      },
    });
    res.status(200).json(events);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const GetEvent: RequestHandler = async (req, res) => {
  try {
    const userId = getUserIdFromCookie(req);
    if(!userId){
      res.status(403).json({ message: "You are not authorized to get this event" });
      return;
    }
    const { eventId } = req.params;
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: userId,
      },
    });
    res.status(200).json(event);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const GetPublicEvent: RequestHandler = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    res.status(200).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const UpdateEvent: RequestHandler = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updateFields = req.body;
    
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    // Validate user owns the event
    const isUserEvent = await validateIsUserEvent(userId, eventId);
    if (!isUserEvent) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    // Prepare update data
    const updateData: any = {};
    
    // Handle date fields separately
    if (updateFields.eventDate) {
      const date = new Date(updateFields.eventDate);
      if (isNaN(date.getTime())) {
        res.status(400).json({ message: "Invalid eventDate format" });
        return ;
      }
      updateData.eventDate = date;
    }
    
    // Handle other fields
    const allowedFields = ['title', 'description', 'location', 'isPublished', 'publishedUrl'];
    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        updateData[field] = updateFields[field];
      }
    }
    
    // Add published timestamp if publishing
    if (updateFields.isPublished === true) {
      updateData.publishedDateTime = new Date();
    }

    // Only update if we have fields to update
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: "No valid fields to update" });
      return ;
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData
    });
    
    res.status(200).json(updatedEvent);
    return ;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
}

const validateIsUserEvent = async (userId : string, eventId: string) : Promise<boolean> => {
  try{
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: userId,
      }
    });
    if(event){
      return true;
    }
    return false;
  }catch(err){
    console.log(err);
    return false;
  }
}

