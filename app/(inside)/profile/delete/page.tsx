import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/get-user';
// username and full_name come from app_metadata — no DB query needed
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { DeleteFlow } from './DeleteFlow';

export const metadata: Metadata = {
    title: 'Delete Account',
};

export default async function DeleteAccountPage() {
    const [user, supabase] = await Promise.all([getUser(), createClient()]);
    if (!user) redirect('/auth/login');

    const username = user.app_metadata?.username as string | undefined;
    const fullName = user.app_metadata?.full_name as string | undefined;
    if (!username) redirect('/onboarding');

    const { count: reviewCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    return (
        <div className="bg-white dark:bg-zinc-950">
            <DeleteFlow
                username={username}
                displayName={fullName || username}
                reviewCount={reviewCount ?? 0}
            />
        </div>
    );
}