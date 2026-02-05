import { OnboardingForm } from '@/components/onboarding-form';
import { createClient } from '@/lib/supabase/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Metadata } from 'next';
import { GalleryVerticalEnd } from 'lucide-react';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Onboarding — DeeperWeave',
    description: 'Complete your profile to get started.',
};

export default async function OnboardingPage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
        redirect('/sign-in');
    }

    const metadata = session.user.user_metadata ?? {};
    const fullName = (metadata.full_name || metadata.name || 'there') as string;
    const avatar = (metadata.picture || metadata.avatar_url || null) as string | null;

    const initials = fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="bg-muted/40 flex min-h-svh flex-col items-center justify-center gap-8 p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col items-center gap-8">
                {/* Brand + Greeting */}
                <div className="flex flex-col items-center gap-6 text-center">
                    <div className="flex items-center gap-2.5 font-semibold tracking-tight">
                        <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        DeeperWeave
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                            <AvatarImage src={avatar ?? undefined} alt={fullName} />
                            <AvatarFallback className="text-xl font-medium bg-muted">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <h1 className="text-2xl font-medium tracking-tight">
                            Welcome, {fullName.split(' ')[0]}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Let’s complete your profile in a few quick steps.
                        </p>
                    </div>
                </div>

                <OnboardingForm />
            </div>
        </div>
    );
}