import { AccessType } from "../enums/AccessType"
import DateWrapper from "../utils/DateUtil"

export interface Event {
    id: string
    title: string,
    description: string,
    eventDate: string | DateWrapper,
    location: string,
    coverImageUrl: string,
    isPublished: boolean,
    publishedUrl:string,
    accessType: AccessType,
    pin: number,
    publishedDateTime: string | DateWrapper,
    media: EventMedia[]
}

export interface CreateEventModel{
    title: string,
    description?: string,
    eventDate?: DateWrapper,
    location?: string,
    coverImage?: string,
    isPublished: boolean,
    accessType: AccessType,
}

export interface EventMedia{
    id: string,
    fileName: string,
    url: string,
    type: "image" | "video"
}