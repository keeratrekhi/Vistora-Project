import { z } from "zod";

export const portfolioInfoSchema = z.object({
  generalInfo: z.object({
    name:
     z.string()
     .min(1, {message : "Name is required"})
     .regex(/^[a-z0-9-]+$/, {
        message:
          "URL can only contain lowercase letters, numbers, and hyphens (no spaces or special characters)",
      })
      .transform((val) => val.toLowerCase()),
    studioName: z.string().min(1, "Studio Name is required"),
    description: z.string().min(1, "Description is required"),
    contact: z.string().min(1, "Contact is required"),
    email: z.string().email("Invalid email address"),
    address: z.object({
      area: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
    }),
  }),
  socialLinks: z.object({
    facebookLink: z
      .string()
      .url("Invalid Facebook URL")
      .optional()
      .or(z.literal("")),
    twitterLink: z
      .string()
      .url("Invalid Twitter URL")
      .optional()
      .or(z.literal("")),
    instagramLink: z
      .string()
      .url("Invalid Instagram URL")
      .optional()
      .or(z.literal("")),
    youtubeLink: z
      .string()
      .url("Invalid YouTube URL")
      .optional()
      .or(z.literal("")),
    websiteLink: z
      .string()
      .url("Invalid website URL")
      .optional()
      .or(z.literal("")),
  }),
  coverImage: z.string().optional(),
});
export type PortfolioInfoFormData = z.infer<typeof portfolioInfoSchema>;
