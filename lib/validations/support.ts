import { z } from "zod";

export const supportSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),

    // ✅ FIX: Remove the 'errorMap' complexity.
    // Zod enums will return "Invalid enum value" by default which is fine.
    // If you really want a custom message, use .refine() or pass the options strictly.
    subject: z.enum(["general", "bug", "billing", "feature"], {
        message: "Please select a valid subject." // Try 'message' instead of 'errorMap'
    }),

    message: z.string().min(10, {
        message: "Message must be at least 10 characters.",
    }).max(1000, {
        message: "Message cannot exceed 1000 characters.",
    }),
});