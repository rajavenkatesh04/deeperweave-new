'use server'

import { createClient } from '@/lib/supabase/server';
import { onboardingSchema, OnboardingInput } from '@/lib/validations/onboarding';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function checkUsernameAvailability(username: string) {
    if (username.length < 3) return false;

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .maybeSingle();

    if (error) {
        console.error(error);
        return false;
    }

    // if a row exists → taken
    return !data;
}



export async function completeOnboarding(data: OnboardingInput) {
    const parsed = onboardingSchema.safeParse(data);
    if (!parsed.success) {
        return { error: 'Invalid data format' };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    // Final Availability Check (Race condition protection)
    const isAvailable = await checkUsernameAvailability(parsed.data.username);
    if (!isAvailable) {
        return { error: 'Username was just taken. Please choose another.' };
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            username: parsed.data.username.toLowerCase(),
            display_name: parsed.data.display_name,
            bio: parsed.data.bio,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        return { error: 'Failed to save profile. Please try again.' };
    }

    revalidatePath('/', 'layout');
    redirect('/profile');
}