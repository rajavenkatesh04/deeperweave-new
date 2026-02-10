import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { SubscriptionPlans } from './subscription-plans'; // Client Component

export const metadata: Metadata = {
    title: 'Subscriptions • DeeperWeave',
};

export default async function SubscriptionPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Fetch current tier from metadata (Fast Read)
    const currentTier = user.user_metadata?.tier || 'auteur';

    return (
        <div className="container max-w-5xl mx-auto py-12 px-4 space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
                    Upgrade your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Lens</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Unlock the Director's Cut of your profile. Unlimited lists, custom sections, and advanced curation tools.
                </p>
            </div>

            <SubscriptionPlans currentTier={currentTier} />

            <div className="text-center text-xs text-muted-foreground pt-8">
                <p>Prices are adjusted for local purchasing power.</p>
                <p>You can cancel at any time. Features are instantly revoked upon cancellation.</p>
            </div>
        </div>
    );
}