import { z } from 'zod';

export const usernameSchema = z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(20, { message: 'Username must be under 20 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Only letters, numbers, and underscores allowed' });

export const onboardingSchema = z.object({
    username: usernameSchema,
    display_name: z.string().min(2, 'Display name is required'),
    bio: z.string().max(160).optional(),
    // We keep these optional to lower friction, but you can enforce them if you want
    website: z.string().url().optional().or(z.literal('')),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;