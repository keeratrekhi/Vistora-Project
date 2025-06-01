import { CreateEventModel, Event } from "../models/Event";
import { APIResponse, APIService } from "./APIService";
import DateWrapper from "@/utils/DateUtil";


// Let UpdateEventPayload require an `id`, but make everything else optional
interface UpdateEventPayload {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  eventDate?: string;      // or Date | ISO string, whichever your API expects
  isPublished?: boolean;
  publishedUrl?: string;
  // pin, coverImageUrl, etc, only if you intend to update them
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
