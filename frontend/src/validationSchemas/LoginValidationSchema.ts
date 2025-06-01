import { z } from "zod";

export const LoginValidationSchema = z.object({
    email: z.string().email("Enter valid email"),
    password: z.string().min(6, "Password must be atleast 6 characters"),
})

export type LoginFormData = z.infer<typeof LoginValidationSchema>;