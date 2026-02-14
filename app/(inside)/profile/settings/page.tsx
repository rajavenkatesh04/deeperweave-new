import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { ProfileSettingsForm } from "@/app/(inside)/profile/settings/ProfileSettingsForm";

export const metadata: Metadata = {
    title: 'Settings • DeeperWeave',
};

export default async function SettingsPage() {
    const supabase = await createClient();

    // 1. Fetch User
    const { data: { user } } = await supabase.auth.getUser();

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
        <div className="container max-w-2xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-500">
            <ProfileSettingsForm
                user={user}
                profile={profile}
            />
        </div>
    );
}