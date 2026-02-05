import { z } from "zod";

export const onboardingSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores allowed"),
    // Note: Availability check happens in the UI via RPC

    bio: z.string().max(160, "Bio must be 160 characters or less").optional(),

    country: z.string({
    }).min(1, "Please select your country"),

    date_of_birth: z.date({
    }).refine((date) => {
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        const dayDiff = today.getDate() - date.getDate();

        // More accurate age calculation
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            return age - 1 >= 18;
        }
        return age >= 18;
    }, { message: "You must be at least 18 years old to use this platform" }),

    content_preference: z.enum(["sfw", "all"], {
        message: "Please select your content preference",
    }),

    // Legal declarations
    agree_to_terms: z.boolean().refine((val) => val === true, {
        message: "You must accept the Terms of Service",
    }),

    is_over_18: z.boolean().refine((val) => val === true, {
        message: "You must legally attest to being over 18",
    }),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;