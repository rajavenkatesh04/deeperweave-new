import { OnboardingForm } from '@/components/onboarding-form';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Onboarding — DeeperWeave',
    description: 'Complete your profile to get started.',
};

export default async function OnboardingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/sign-in');
    }

    const appMeta = user.app_metadata ?? {};
    const userMeta = user.user_metadata ?? {};

    const fullName = (
        appMeta.full_name ||
        userMeta.full_name ||
        userMeta.name ||
        'there'
    ) as string;

    const avatar = (
        appMeta.avatar_url ||
        userMeta.picture ||
        userMeta.avatar_url ||
        null
    ) as string | null;

    return <OnboardingForm userName={fullName} avatar={avatar} />;
}