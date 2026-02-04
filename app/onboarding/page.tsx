import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OnboardingForm } from './onboarding-form';
import Image from 'next/image';

export default async function OnboardingPage() {
    const supabase = await createClient();

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/auth/login');
    }

    // 2. Check if they actually need onboarding
    const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('id', user.id)
        .single();

    // If they already have a username, they are done. Kick them out.
    if (profile?.username) {
        redirect('/profile');
    }

    // 3. Render the Cinematic Onboarding
    return (
        <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">

            {/* Cinematic Background (Vercel Defense: Static Optimized Image) */}
            <div className="absolute inset-0 z-0 opacity-40">
                <Image
                    src="/post-customization.png" // Ensure this file exists in /public or change to a placeholder
                    alt="Background"
                    fill
                    className="object-cover blur-sm scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
            </div>

            <OnboardingForm
                initialEmail={user.email || ''}
                initialName={profile?.display_name || user.user_metadata?.full_name}
            />
        </main>
    );
}