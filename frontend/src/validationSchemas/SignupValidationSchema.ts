import { z } from "zod";

export const SignupValidationSchema = z.object({
    email: z.string({}).email("Enter valid email"),
    password: z.string({}).min(6, "Password must be atleast 6 characters"),
})

export type SignupFormData = z.infer<typeof SignupValidationSchema>;