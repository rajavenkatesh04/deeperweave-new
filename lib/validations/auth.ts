// lib/validations/auth.ts
import { z } from 'zod'

export const signUpSchema = z.object({
    fullName: z.string().min(2),
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
});