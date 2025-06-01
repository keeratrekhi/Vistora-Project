import { z } from 'zod'
import { AccessType } from '../enums/AccessType'

export const EventValidationSchema = z.object({
    id: z.any(),
    title: z.string({
        required_error: "Title is required",
    }).min(3, "Title must be atleast 3 characters"),
    description: z.string({
        required_error: "Description is required"
    }),
    eventDate: z.string({
        required_error: "Event date is required",
        invalid_type_error: "Event date is required"
    }).date("Event date is required"),
    location: z.string({
        required_error: "Location is required",
        invalid_type_error: "Location must be atleast 3 characters"
    }),
    coverImage: z.optional(z.string().url("Enter valid URL")),
    isPublished: z.boolean(),
    accessType: z.optional(z.nativeEnum(AccessType)),
    pin: z
        .string()
        .min(4, "Pin must be at least 4 digits")
        .max(10, "Pin must be at most 10 digits")
        .regex(/^\d+$/, "Pin must contain only numbers"),
    publishedDateTime: z.string({
        required_error: "Published date is required",
        invalid_type_error: "Published date is required"
    }).date("Published date is required")
})

export type EventFormData = z.infer<typeof EventValidationSchema>;