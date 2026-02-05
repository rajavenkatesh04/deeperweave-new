'use server'

import { createClient } from '@/lib/supabase/server';
import { onboardingSchema, OnboardingInput } from '@/lib/validations/onboarding';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function checkUsernameAvailability(username: string): Promise<boolean> {
    const supabase = await createClient();
    const cleaned = username.trim().toLowerCase();

    // Uses the SECURITY DEFINER function we created earlier
    const { data, error } = await supabase.rpc('check_username_available', {
        username_input: cleaned
    });

    if (error) {
        console.error('RPC Error:', error);
        return false; // Fail safe
    }
    return data;
}

export async function completeOnboarding(data: OnboardingInput) {
    // Validate on server side
    const parsed = onboardingSchema.safeParse(data);
    if (!parsed.success) {
        return { error: 'Invalid data submitted.' };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized session.' };
    }

    const cleanUsername = parsed.data.username.trim().toLowerCase();

    // 1. Update Database
    // We do NOT update display_name here, preserving what was set at signup
    const { error: dbError } = await supabase
        .from('profiles')
        .update({
            username: cleanUsername,
            bio: parsed.data.bio,
            country: parsed.data.country,
            date_of_birth: parsed.data.date_of_birth.toISOString(), // Convert Date obj to string
            content_preference: parsed.data.content_preference,
            updated_at: new Date().toISOString(),
            // Ensure status is updated if you have a status column (e.g., onboarding_complete: true)
        })
        .eq('id', user.id);

    if (dbError) {
        console.error("Onboarding DB Error:", dbError);
        if (dbError.code === '23505') return { error: 'This username is already taken.' };
        return { error: 'Failed to create profile. Please try again.' };
    }

    // 2. Update Auth Metadata (Cache username for faster access)
    const { error: authError } = await supabase.auth.updateUser({
        data: {
            username: cleanUsername,
        }
    });

    if (authError) {
        console.error("Metadata Sync Error:", authError);
    }

    revalidatePath('/', 'layout');
    redirect('/profile');
}