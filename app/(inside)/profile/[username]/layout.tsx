// app/(inside)/profile/[username]/layout.tsx
import { getFollowStatus, getProfileMetadata } from '@/lib/data/profile-data';
import { ProfileHeader } from '@/app/ui/profile/ProfileHeader';
import { ProfileStats } from '@/app/ui/profile/ProfileStats';
import { getUser } from '@/lib/supabase/get-user';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { StatsSkeleton } from "@/app/ui/skeleton";
import TabNavigation from "@/app/(inside)/profile/[username]/TabNavigation";
import PrivateProfileScreen from '@/app/ui/profile/PrivateProfileScreen';

type Props = {
    children: React.ReactNode;
    params: Promise<{ username: string }>;
};

// SEO METADATA
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
    const { username } = await params;
    const profile = await getProfileMetadata(username);

    if (!profile) return { title: 'Profile Not Found' };

    const description = profile.bio || `Check out ${profile.full_name}'s reviews on DeeperWeave.`;

    return {
        title: `${profile.full_name} (@${profile.username})`,
        description,
        openGraph: {
            title: `${profile.full_name} (@${profile.username})`,
            description,
            ...(profile.avatar_url && { images: [{ url: profile.avatar_url }] }),
        },
    };
}

export default async function ProfileLayout({
                                                children,
                                                params,
                                            }: {
    children: React.ReactNode;
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;

    // ⚡ OPTIMIZATION: Fetch everything in parallel
    const [profile, user] = await Promise.all([
        getProfileMetadata(username),  // Cached (24hr)
        getUser()                      // Deduplicated across all server components in this request
    ]);

    if (!profile) notFound();
    const isOwnProfile = user?.id === profile.id;
    const isPrivate = profile.visibility === 'private';

    // Only check follow status if needed (not own profile)
    let isFollowing = false;
    if (user && !isOwnProfile) {
        isFollowing = await getFollowStatus(profile.id);
    }

    const canViewContent = !isPrivate || isFollowing || isOwnProfile;

    return (
        <div className="flex flex-col min-h-screen">
            <ProfileHeader
                profile={profile}
                isOwnProfile={isOwnProfile}
                initialIsFollowing={isFollowing}
                statsSlot={
                    <Suspense fallback={<StatsSkeleton />}>
                        {/* Stats load separately, don't block page render */}
                        <ProfileStats
                            userId={profile.id}
                            username={profile.username || ''}
                        />
                    </Suspense>
                }
            />
            <main className="flex-1">
                {canViewContent ? (
                    <>
                        <TabNavigation username={username} />
                        {children}
                    </>
                ) : (
                    <PrivateProfileScreen />
                )}
            </main>
        </div>
    );
}