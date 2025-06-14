import { AccessType } from "@/enums/AccessType";
import { CreateEventModel, Event } from "../models/Event";
import { APIResponse, APIService } from "./APIService";
import DateWrapper from "@/utils/DateUtil";


// Let UpdateEventPayload require an `id`, but make everything else optional
interface UpdateEventPayload {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  eventDate?: string;      // or ISO string
  isPublished?: boolean;
  publishedUrl?: string;
  coverImageUrl?: string; 
  accessType?: AccessType;     
}

const env = import.meta.env;

export const getAllEvents = async (): Promise<Event[]> => {
  const response = await APIService.get<Event[]>(env.VITE_EVENTS_URL);

  return response.data.map((event: Event) => ({
    ...event,
    eventDate: new DateWrapper(event.eventDate as string), // Convert to DateWrapper
    publishedDateTime: new DateWrapper(event.publishedDateTime as string), // Convert to DateWrapper
  }));
};

export const getEvent = async (id: string): Promise<Event> => {
  const response = await APIService.get<Event>(`${env.VITE_EVENTS_URL}/${id}`);
  return {
    ...response.data,
    eventDate: new DateWrapper(response.data.eventDate as string), // Convert to DateWrapper
    publishedDateTime: new DateWrapper(
      response.data.publishedDateTime as string
    ), // Convert to DateWrapper
  };
};

// src/services/EventsService.ts
export const getPublicEvent = async (eventId: string): Promise<Event | null> => {

    const response = await APIService.get<Event>(`${env.VITE_PUBLIC_EVENTS_URL}/${eventId}`);
   return {
    ...response.data,
    eventDate: new DateWrapper(response.data.eventDate as string), // Convert to DateWrapper
    publishedDateTime: new DateWrapper(
      response.data.publishedDateTime as string
    ), // Convert to DateWrapper
  
};
}



export const updateEvent = async (
  updatedEvent: UpdateEventPayload
): Promise<APIResponse<string>> => {
  const response = await APIService.put<string, UpdateEventPayload>(
    `${env.VITE_EVENTS_URL}/${updatedEvent.id}`,
    updatedEvent
  );
  return response;
};


export const createEvent = async (event: CreateEventModel,id: string): Promise<void> => {
  await APIService.post<string, CreateEventModel>(env.VITE_EVENTS_URL,event);
  return;
};



export interface CoverFile {
  url: string;
  name: string;
  type: string;
  size: number;
}

export async function getEventCovers(eventId: string): Promise<CoverFile[]> {
  const response = await APIService.get<{ covers: CoverFile[] }>(
    `${env.VITE_EVENTS_API_URL}/eventscover/${eventId}`,
    {
      withCredentials: true,
    }
  );
  return response.data.covers;
}