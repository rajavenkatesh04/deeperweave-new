import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z.string().min(1, { message: 'Password is required' }),
});

export const signupSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string()
        .min(6, { message: 'Password must be at least 6 characters.' })
        .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
        .regex(/[0-9]/, { message: 'Password must contain at least one number.' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;