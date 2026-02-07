// app/(inside)/profile/[username]/layout.tsx
import {getFollowStatus, getProfileMetadata} from '@/lib/data/profile-data';
import { ProfileHeader } from '@/app/ui/profile/ProfileHeader';
import { ProfileStats } from '@/app/ui/profile/ProfileStats';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Metadata } from 'next';
import {StatsSkeleton} from "@/app/ui/skeleton";

type Props = {
    children: React.ReactNode;
    params: Promise<{ username: string }>;
};

// 1. SEO MAGIC (This is why you separated the data file!)
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
    const { username } = await params;

    // Re-uses the exact same cached fetch! Zero extra cost.
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

    // ⚡ OPTIMIZATION: Start both requests instantly in parallel!
    // We don't need the profile data to start checking if the user is logged in.
    const [profile, authResponse] = await Promise.all([
        getProfileMetadata(username), // Hit Vercel Cache
        supabase.auth.getUser()       // Hit Supabase Auth
    ]);

    if (!profile) notFound();

    // Now we have both results safely
    const user = authResponse.data.user;
    const isOwnProfile = user?.id === profile.id;

    let isFollowing = false;
    if (user && !isOwnProfile) {
        isFollowing = await getFollowStatus(profile.id);
    }

    return (
        <div className="flex flex-col min-h-screen">
            <ProfileHeader
                profile={profile}
                isOwnProfile={isOwnProfile}
                initialIsFollowing={isFollowing}
                statsSlot={
                    <Suspense fallback={<StatsSkeleton />}>
                        <ProfileStats userId={profile.id} username={profile.username || ''} />
                    </Suspense>
                }
            />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}