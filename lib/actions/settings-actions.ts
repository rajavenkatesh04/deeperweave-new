'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ContentPreference, ProfileVisibility } from '@/lib/definitions';

interface SettingsUpdate {
    content_preference?: ContentPreference;
    visibility?: ProfileVisibility;
    // Personal details
    gender?: string;
    country?: string;
    date_of_birth?: string; // Expecting ISO string or YYYY-MM-DD
}

export async function updateSettings(data: SettingsUpdate) {
    const supabase = await createClient();

    // 1. Get User (Cheap, no DB)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // 2. Prepare DB Update Object
    const updates: any = {
        updated_at: new Date().toISOString(),
    };

    // Only add fields that are actually defined in the input
    if (data.content_preference) updates.content_preference = data.content_preference;
    if (data.visibility) updates.visibility = data.visibility;
    if (data.gender) updates.gender = data.gender;
    if (data.country) updates.country = data.country;
    if (data.date_of_birth) updates.date_of_birth = data.date_of_birth;

    // 3. Update Database (The Source of Truth)
    const { error: dbError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

    if (dbError) {
        console.error('Settings Update Error:', dbError);
        return { error: 'Failed to update settings.' };
    }

    // 4. Update Auth Metadata (The Cache)
    // We sync high-read fields to metadata so we don't query DB on every page view
    const metadataUpdates: any = {};
    if (data.content_preference) metadataUpdates.content_preference = data.content_preference;

    if (Object.keys(metadataUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser({
            data: metadataUpdates
        });
        if (authError) console.error('Metadata Sync Error:', authError);
    }

    // 5. Revalidate Paths
    revalidatePath('/profile/settings');
    revalidatePath(`/profile/${user.user_metadata.username}`);

    return { success: true };
}

export async function deleteAccount() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // Note: For a real production app, you usually need a specialized
    // Supabase Edge Function to recursively delete Storage files and DB rows.
    // For this implementation, we will sign them out.

    await supabase.auth.signOut();
    redirect('/auth/login');
}