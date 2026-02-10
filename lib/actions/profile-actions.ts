'use server'

import { createClient } from '@/lib/supabase/server';
import { onboardingSchema, OnboardingInput } from '@/lib/validations/onboarding';
import {ProfileUpdateSchema} from '@/lib/validations/profile'
import { redirect } from 'next/navigation';
import {revalidatePath, revalidateTag} from 'next/cache';

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
    redirect('/');
}


export async function updateProfile(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // 1. Parse Data
    const rawData = {
        full_name: formData.get('full_name'),
        username: formData.get('username'),
        bio: formData.get('bio'),
        avatar_url: formData.get('avatar_url'),
    };

    const validated = ProfileUpdateSchema.safeParse(rawData);

    if (!validated.success) {
        // ✅ FIX: Use .issues instead of .errors
        return { error: validated.error.issues[0].message };
    }

    const { full_name, username, bio, avatar_url } = validated.data;

    // 2. Check Username Uniqueness
    if (username) {
        const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .neq('id', user.id)
            .single();

        if (existing) {
            return { error: 'Username is already taken.' };
        }
    }

    // 3. Update Database
    const { error } = await supabase
        .from('profiles')
        .update({
            full_name,
            username,
            bio,
            avatar_url,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        console.error('Profile Update Error:', error);
        return { error: 'Failed to update profile.' };
    }

    // 4. Sync Metadata
    await supabase.auth.updateUser({
        data: { username }
    });

    // 5. STORAGE CLEANUP
    if (avatar_url) {
        try {
            const newFileName = avatar_url.split('/').pop();
            const { data: files } = await supabase.storage.from('avatars').list(user.id);

            if (files && files.length > 0) {
                const filesToDelete = files
                    .filter(file => file.name !== newFileName)
                    .map(file => `${user.id}/${file.name}`);

                if (filesToDelete.length > 0) {
                    await supabase.storage.from('avatars').remove(filesToDelete);
                }
            }
        } catch (err) {
            console.error("Avatar Cleanup Error:", err);
        }
    }

    // 6. CACHE INVALIDATION
    revalidateTag(`profile-${username}`, 'max');
    revalidatePath(`/profile/${username}`);
    revalidatePath('/profile/edit');

    return { success: true, message: 'Profile updated successfully' };
}