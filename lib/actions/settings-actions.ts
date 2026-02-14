'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { ContentPreference, ProfileVisibility } from '@/lib/definitions';

interface SettingsUpdate {
    content_preference?: ContentPreference;
    visibility?: ProfileVisibility;
    gender?: string;
    country?: string;
    date_of_birth?: string;
}

export async function updateSettings(data: SettingsUpdate) {
    const supabase = await createClient();

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // 2. Get username from app_metadata (not user_metadata!)
    const username = user.app_metadata?.username;

    // 3. Prepare DB Update Object
    const updates: any = {
        updated_at: new Date().toISOString(),
    };

    if (data.content_preference) updates.content_preference = data.content_preference;
    if (data.visibility) updates.visibility = data.visibility;
    if (data.gender) updates.gender = data.gender;
    if (data.country) updates.country = data.country;
    if (data.date_of_birth) updates.date_of_birth = data.date_of_birth;

    // 4. Update Database (Source of Truth)
    const { error: dbError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

    if (dbError) {
        console.error('Settings Update Error:', dbError);
        return { error: 'Failed to update settings.' };
    }

    // 5. ✅ NO MANUAL METADATA SYNC NEEDED!
    // Your database trigger (sync_profile_to_app_metadata) handles it automatically

    // 6. Cache Invalidation
    revalidatePath('/profile/settings');

    if (username) {
        revalidateTag(`profile-${username}`, 'max');
        revalidatePath(`/profile/${username}`);
    }

    return { success: true };
}

export async function deleteAccount() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // Get username before deleting
    const username = user.app_metadata?.username;

    // Delete user's profile data
    // Note: Set up CASCADE deletes in your database schema for related data
    const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

    if (deleteError) {
        console.error('Profile deletion error:', deleteError);
        return { error: 'Failed to delete account.' };
    }

    // Invalidate cache
    if (username) {
        revalidateTag(`profile-${username}`, 'max');
    }

    // Sign out and redirect
    await supabase.auth.signOut();
    redirect('/auth/login');
}