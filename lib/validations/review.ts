import { z } from 'zod';

// Limits
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const reviewSchema = z.object({
    tmdb_id: z.coerce.number().min(1, "Please select a movie or show."),

    media_type: z.enum(['movie', 'tv']),

    rating: z.coerce
        .number()
        .min(0, "Rating must be at least 0.")
        .max(5, "Rating cannot exceed 5."),

    content: z.string().optional(),

    // ✅ Fix: HTML date input returns string, not Date
    watched_on: z
        .string()
        .min(1, "Please select a date.")
        .refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid date format.",
        }),

    // ✅ Fix: Don't use default() here — let RHF control default
    contains_spoilers: z.coerce.boolean().optional(),

    viewing_method: z
        .enum(['theatre', 'ott', 'bluray', 'broadcast'])
        .nullable()
        .optional(),

    viewing_service: z.string().optional(),

    watched_with: z.string().optional(),

    photo: z
        .instanceof(File)
        .optional()
        .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
            message: "Max file size is 5MB.",
        })
        .refine(
            (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
            {
                message: "Only .jpg, .jpeg, .png and .webp formats are supported.",
            }
        ),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;