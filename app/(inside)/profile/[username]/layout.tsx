// app/(inside)/profile/[username]/layout.tsx
import { getFollowStatus, getProfileMetadata } from '@/lib/data/profile-data';
import { ProfileHeader } from '@/app/ui/profile/ProfileHeader';
import { ProfileStats } from '@/app/ui/profile/ProfileStats';
import { createClient } from '@/lib/supabase/server';
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

    return {
        title: `${profile.full_name} (@${profile.username}) • DeeperWeave`,
        description: profile.bio || `Check out ${profile.full_name}'s reviews on DeeperWeave.`,
        openGraph: {
            images: profile.avatar_url ? [profile.avatar_url] : [],
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
    const supabase = await createClient();

    // ⚡ OPTIMIZATION: Fetch everything in parallel
    const [profile, authResponse] = await Promise.all([
        getProfileMetadata(username),  // Cached (24hr)
        supabase.auth.getUser()        // Fast (JWT validation)
    ]);

    if (!profile) notFound();

    const user = authResponse.data.user;
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