import { z } from 'zod';

// Schema Validation (You can move this to /lib/validations/profile.ts later)
export const ProfileUpdateSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters").max(50),
    username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
    bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
    avatar_url: z.string().optional(),
});