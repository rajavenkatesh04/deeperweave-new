import { getProfileMetadata } from '@/lib/data/profile-data';
import { getUser } from '@/lib/supabase/get-user';
import { notFound } from 'next/navigation';
import { FollowingList } from '@/app/ui/social/FollowingList';

export default async function FollowingPage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;

    const [profile, user] = await Promise.all([
        getProfileMetadata(username),
        getUser(),
    ]);

    if (!profile) notFound();

    return (
        <div className="w-full max-w-2xl mx-auto py-6 px-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <FollowingList targetUserId={profile.id} viewerId={user?.id} />
        </div>
    );
}
