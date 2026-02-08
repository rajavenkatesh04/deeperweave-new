import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import {ProfileSettingsForm} from "@/app/(inside)/profile/settings/ProfileSettingsForm";

export const metadata: Metadata = {
    title: 'Settings • DeeperWeave',
};

// Enable caching where possible, but this route is inherently dynamic (user-specific)
// export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const supabase = await createClient();

    // 1. Fetch User (Required to know WHO we are)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // 2. Fetch Profile (Targeted DB Read)
    // CRITICAL FIX: We specifically filter by the user's ID (.eq('id', user.id))
    // Using .single() without .eq() on a public table causes a crash (Result contains > 1 rows).
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error || !profile) {
        console.error("Profile Fetch Error:", error);
        // If auth exists but profile is missing, they need onboarding
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