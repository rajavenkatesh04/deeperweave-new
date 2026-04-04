import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/get-user';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { ProfileSettingsForm } from "@/app/(inside)/profile/settings/ProfileSettingsForm";

export const metadata: Metadata = {
    title: 'Settings',
};

export default async function SettingsPage() {
    const [user, supabase] = await Promise.all([getUser(), createClient()]);

    if (!user) {
        redirect('/auth/login');
    }

    // Only fetch fields not already in app_metadata (bio, gender, country, date_of_birth, trial_until)
    const { data: profileExtra, error } = await supabase
        .from('profiles')
        .select('bio, gender, country, date_of_birth, trial_until')
        .eq('id', user.id)
        .single();

    if (error || !profileExtra) {
        console.error("Profile Fetch Error:", error);
        redirect('/onboarding');
    }

    // Merge app_metadata (always fresh via JWT) with DB-only fields
    const profile = {
        ...profileExtra,
        username:           user.app_metadata?.username   ?? null,
        full_name:          user.app_metadata?.full_name  ?? null,
        avatar_url:         user.app_metadata?.avatar_url ?? null,
        tier:               user.app_metadata?.tier       ?? 'free',
        content_preference: user.app_metadata?.content_preference ?? 'sfw',
        visibility:         user.app_metadata?.visibility ?? 'public',
    };

    return (
        <div className="mt-10">
            <ProfileSettingsForm
                user={user}
                profile={profile}
            />
        </div>
    );
}