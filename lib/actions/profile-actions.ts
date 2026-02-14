'use server';

import { createClient } from '@/lib/supabase/server';
import { onboardingSchema, OnboardingInput } from '@/lib/validations/onboarding';
import { ProfileUpdateSchema } from '@/lib/validations/profile';
import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * CHECK USERNAME AVAILABILITY (RPC)
 */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
    const supabase = await createClient();
    const cleaned = username.trim().toLowerCase();

    const { data, error } = await supabase.rpc('check_username_available', {
        username_input: cleaned,
    });

    if (error) {
        console.error('RPC Error:', error);
        return false; // fail-safe
    }

    return data;
}

/**
 * COMPLETE ONBOARDING
 */
export async function completeOnboarding(data: OnboardingInput) {
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

    // DB update (triggers automatic app_metadata sync)
    const { error: dbError } = await supabase
        .from('profiles')
        .update({
            username: cleanUsername,
            bio: parsed.data.bio,
            gender: parsed.data.gender,
            country: parsed.data.country,
            date_of_birth: parsed.data.date_of_birth.toISOString(),
            content_preference: parsed.data.content_preference,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (dbError) {
        console.error('Onboarding DB Error:', dbError);
        if (dbError.code === '23505') {
            return { error: 'This username is already taken.' };
        }
        return { error: 'Failed to create profile. Please try again.' };
    }

    // ✅ NO MANUAL METADATA SYNC NEEDED!
    // Your database trigger (sync_profile_to_app_metadata) handles it automatically

    // Invalidate profile cache
    revalidateTag(`profile-${cleanUsername}`, 'max');
    return { success: true };
}

/**
 * UPDATE PROFILE
 * (DB is source of truth, app_metadata is auto-synced via trigger)
 */
export async function updateProfile(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // 🔑 Get OLD username from app_metadata (not user_metadata!)
    const oldUsername: string | undefined = user.app_metadata?.username;

    // Parse form data
    const rawData = {
        full_name: formData.get('full_name'),
        username: formData.get('username'),
        bio: formData.get('bio'),
        avatar_url: formData.get('avatar_url'),
    };

    const validated = ProfileUpdateSchema.safeParse(rawData);
    if (!validated.success) {
        return { error: validated.error.issues[0].message };
    }

    const { full_name, username, bio, avatar_url } = validated.data;

    // Username uniqueness check (only if changed)
    if (username && username !== oldUsername) {
        const isAvailable = await checkUsernameAvailability(username);
        if (!isAvailable) {
            return { error: 'Username is already taken.' };
        }
    }

    // -----------------------------
    // 1. UPDATE DATABASE (TRUTH)
    // -----------------------------
    // This automatically triggers sync_profile_to_app_metadata()
    const { error: dbError } = await supabase
        .from('profiles')
        .update({
            full_name,
            username,
            bio,
            avatar_url,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (dbError) {
        console.error('Profile Update Error:', dbError);
        return { error: 'Failed to update profile.' };
    }

    // -----------------------------
    // 2. NO MANUAL METADATA SYNC NEEDED!
    // -----------------------------
    // The database trigger handles it automatically.
    // It updates auth.users.raw_app_meta_data which is:
    // ✅ OAuth-proof (won't be overwritten)
    // ✅ Available in user.app_metadata on next request
    // ✅ Zero maintenance

    // -----------------------------
    // 3. STORAGE CLEANUP (AVATARS)
    // -----------------------------
    if (avatar_url) {
        try {
            const newFileName = avatar_url.split('/').pop();

            const { data: files } = await supabase.storage
                .from('avatars')
                .list(user.id);

            if (files && files.length > 0) {
                const filesToDelete = files
                    .filter(file => file.name !== newFileName)
                    .map(file => `${user.id}/${file.name}`);

                if (filesToDelete.length > 0) {
                    await supabase.storage
                        .from('avatars')
                        .remove(filesToDelete);
                }
            }
        } catch (err) {
            console.error('Avatar Cleanup Error:', err);
        }
    }

    // -----------------------------
    // 4. CACHE INVALIDATION
    // -----------------------------

    // Invalidate OLD username cache
    if (oldUsername) {
        revalidateTag(`profile-${oldUsername}`, 'max');
        revalidatePath(`/profile/${oldUsername}`);
    }

    // Invalidate NEW username cache
    if (username) {
        revalidateTag(`profile-${username}`, 'max');
        revalidatePath(`/profile/${username}`);
    }

    // Edit page should always refresh
    revalidatePath('/profile/edit');

    return { success: true, message: 'Profile updated successfully' };
}