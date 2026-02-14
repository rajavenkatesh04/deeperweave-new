import { z } from "zod";

export const genderEnum = z.enum(['male', 'female', 'non-binary', 'prefer_not_to_say']);
export type GenderType = z.infer<typeof genderEnum>;

export const onboardingSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores allowed"),

    bio: z.string().max(160, "Bio must be 160 characters or less").optional(),

    // New Field
    gender: genderEnum.refine((val) => !!val, { message: "Please select a gender" }),

    country: z.string().min(1, "Please select your country"),

    date_of_birth: z
        .date()
        .refine((date) => date instanceof Date && !isNaN(date.getTime()), {
            message: "Date of birth is required",
        })
        .refine((date) => {
            const today = new Date();
            let age = today.getFullYear() - date.getFullYear();
            const monthDiff = today.getMonth() - date.getMonth();
            const dayDiff = today.getDate() - date.getDate();

            if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                age--;
            }

            return age >= 18;
        }, {
            message: "You must be at least 18 years old",
        }),

    content_preference: z.enum(["sfw", "all"], {
        message: "Please select your content preference",
    }),

    agree_to_terms: z.boolean().refine((val) => val === true, {
        message: "You must accept the Terms of Service",
    }),

    is_over_18: z.boolean().refine((val) => val === true, {
        message: "You must legally attest to being over 18",
    }),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;