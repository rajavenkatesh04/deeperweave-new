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

    // 2. Fetch Profile (Targeted DB Read)
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error || !profile) {
        console.error("Profile Fetch Error:", error);
        redirect('/onboarding');
    }

    return (
        <div className="mt-10">
            <ProfileSettingsForm
                user={user}
                profile={profile}
            />
        </div>
    );
}