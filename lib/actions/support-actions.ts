'use server';

import { supportSchema } from "@/lib/validations/support";
import { Resend } from 'resend'; // <--- IMPORT THIS

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

export type SupportState = {
    errors?: {
        name?: string[];
        email?: string[];
        subject?: string[];
        message?: string[];
    };
    message?: string | null;
    success?: boolean;
};

export async function sendSupportTicket(
    prevState: SupportState,
    formData: FormData
): Promise<SupportState> {
    // 1. Validate Form Data
    const validatedFields = supportSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Please fix the errors below.",
            success: false,
        };
    }

    const { name, email, subject, message } = validatedFields.data;

    try {
        // 2. SEND EMAIL VIA RESEND 📧
        const { error } = await resend.emails.send({
            from: 'DeeperWeave Support <onboarding@resend.dev>',

            // Where you want to receive the support tickets
            to: ['developer@deeperweave.com'],

            // Important: Allows you to hit "Reply" in Gmail and it goes to the user
            replyTo: email,

            subject: `[Support Ticket] ${subject.toUpperCase()} from ${name}`,
            text: message, // Plain text content
            html: `<p>${message}</p>` // Optional: You can format it nicely if you want
        });

        if (error) {
            console.error("Resend Error:", error);
            return {
                success: false,
                message: "Failed to send email. Please try again.",
            };
        }

        return {
            success: true,
            message: "Ticket sent! We'll get back to you shortly.",
        };
    } catch (error) {
        console.error("Server Error:", error);
        return {
            success: false,
            message: "Something went wrong. Please try again later.",
        };
    }
}