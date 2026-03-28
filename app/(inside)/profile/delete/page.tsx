import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { DeleteFlow } from './DeleteFlow';

export const metadata: Metadata = {
    title: 'Delete Account',
};

export default async function DeleteAccountPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .single();

    if (!profile) redirect('/auth/login');

    const { count: reviewCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    return (
        <div className="bg-white dark:bg-zinc-950">
            <DeleteFlow
                username={profile.username}
                displayName={profile.full_name || profile.username}
                reviewCount={reviewCount ?? 0}
            />
        </div>
    );
}