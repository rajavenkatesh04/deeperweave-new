'use server'

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { ContentPreference, ProfileVisibility } from '@/lib/definitions';
import { Resend } from 'resend';
import { buildDeletionEmail } from '@/lib/emails/deletion-confirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

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

export async function deleteAccount(reason?: string | null, comment?: string | null) {
    // Use the regular client only to verify the session.
    // All destructive ops use the admin client (bypasses RLS).
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const userId = user.id;
    const userEmail = user.email;          // capture before auth row is deleted
    const username = user.app_metadata?.username;
    const admin = await createAdminClient();

    // ─── PHASE 0: SAVE ANONYMOUS FEEDBACK ────────────────────────────────────
    // Stored before deletion so we still have a valid session context.
    // No user_id is saved — fully de-identified.
    if (reason || comment) {
        await admin.from('deletion_feedback').insert({
            reason: reason || null,
            comment: comment?.trim() || null,
        });
    }

    // ─── PHASE 1: STORAGE ────────────────────────────────────────────────────
    // Delete all files owned by this user from every bucket.
    // We don't abort on storage errors — a missing file shouldn't block deletion.

    // 1a. Avatars  →  avatars/{userId}/*
    try {
        const { data: avatarFiles } = await admin.storage
            .from('avatars')
            .list(userId);
        if (avatarFiles && avatarFiles.length > 0) {
            await admin.storage
                .from('avatars')
                .remove(avatarFiles.map(f => `${userId}/${f.name}`));
        }
    } catch (err) {
        console.error('[deleteAccount] Avatar storage cleanup failed:', err);
    }

    // 1b. Review attachments  →  user_uploads/{userId}/timeline/*
    try {
        const { data: uploadFiles } = await admin.storage
            .from('user_uploads')
            .list(`${userId}/timeline`);
        if (uploadFiles && uploadFiles.length > 0) {
            await admin.storage
                .from('user_uploads')
                .remove(uploadFiles.map(f => `${userId}/timeline/${f.name}`));
        }
    } catch (err) {
        console.error('[deleteAccount] Review attachment cleanup failed:', err);
    }

    // ─── PHASE 2: DATABASE ───────────────────────────────────────────────────
    // Delete in dependency order (children before parents) so we don't rely on
    // CASCADE constraints that may or may not be set on each FK.

    // notifications — two FKs (recipient + actor), delete both sides
    await admin.from('notifications')
        .delete()
        .or(`recipient_id.eq.${userId},actor_id.eq.${userId}`);

    // review_mentions referencing this user
    await admin.from('review_mentions')
        .delete()
        .eq('user_id', userId);

    // likes the user gave
    await admin.from('likes')
        .delete()
        .eq('user_id', userId);

    // comments the user wrote
    await admin.from('comments')
        .delete()
        .eq('user_id', userId);

    // section_items — must delete before profile_sections
    const { data: sections } = await admin
        .from('profile_sections')
        .select('id')
        .eq('user_id', userId);
    if (sections && sections.length > 0) {
        await admin.from('section_items')
            .delete()
            .in('section_id', sections.map(s => s.id));
    }
    await admin.from('profile_sections').delete().eq('user_id', userId);

    // reviews (after likes, comments, mentions are gone)
    await admin.from('reviews').delete().eq('user_id', userId);

    // follows — both directions (user following others + others following user)
    await admin.from('follows')
        .delete()
        .or(`follower_id.eq.${userId},following_id.eq.${userId}`);

    // blocks — both directions
    await admin.from('blocks')
        .delete()
        .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

    // saved_items
    await admin.from('saved_items').delete().eq('user_id', userId);

    // subscriptions
    await admin.from('subscriptions').delete().eq('user_id', userId);

    // list_entries → lists (lists table exists even if UI isn't built yet)
    const { data: lists } = await admin
        .from('lists')
        .select('id')
        .eq('user_id', userId);
    if (lists && lists.length > 0) {
        await admin.from('list_entries')
            .delete()
            .in('list_id', lists.map(l => l.id));
    }
    await admin.from('lists').delete().eq('user_id', userId);

    // posts (table exists, UI not built yet)
    await admin.from('posts').delete().eq('author_id', userId);

    // profile (last DB record — parent of everything above)
    const { error: profileDeleteError } = await admin
        .from('profiles')
        .delete()
        .eq('id', userId);
    if (profileDeleteError) {
        console.error('[deleteAccount] Profile delete failed:', profileDeleteError);
        return { error: 'Failed to delete account. Please contact support.' };
    }

    // ─── PHASE 3: AUTH USER ──────────────────────────────────────────────────
    // Removes the record from auth.users and invalidates all active sessions.
    // Must happen AFTER the profile row is gone (profiles.id → auth.users.id FK).
    const { error: authDeleteError } = await admin.auth.admin.deleteUser(userId);
    if (authDeleteError) {
        console.error('[deleteAccount] Auth user delete failed:', authDeleteError);
        return { error: 'Failed to delete account. Please contact support.' };
    }

    // ─── PHASE 4: CONFIRMATION EMAIL ─────────────────────────────────────────
    // Non-fatal — a failed email must not block or reverse the deletion.
    if (userEmail) {
        try {
            await resend.emails.send({
                from: 'DeeperWeave <noreply@deeperweave.com>',
                to: userEmail,
                subject: 'Your DeeperWeave account has been deleted',
                html: buildDeletionEmail(username ?? userEmail),
            });
        } catch (err) {
            console.error('[deleteAccount] Confirmation email failed:', err);
        }
    }

    // ─── PHASE 5: CLEANUP ────────────────────────────────────────────────────
    if (username) {
        revalidateTag(`profile-${username}`, 'max');
    }

    // The auth user is already gone, so signOut just clears the browser cookie.
    await supabase.auth.signOut();
    redirect('/account-deleted');
}