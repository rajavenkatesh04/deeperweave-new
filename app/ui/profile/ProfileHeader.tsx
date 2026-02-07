'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { UserProfile } from '@/lib/definitions';
import FollowButton from '@/app/ui/user/FollowButton';
import {
    MapPinIcon,
    CalendarIcon,
    CheckIcon,
    DocumentDuplicateIcon,
    BellIcon,
    BookmarkIcon
} from '@heroicons/react/24/outline';
import { geistSans } from "@/app/ui/fonts";
import UserBadge from "@/app/ui/user/UserBadge";
import { MdOutlineMoreHoriz } from "react-icons/md";

// --- SUB-COMPONENTS ---

function CopyableHandle({ username }: { username: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(`@${username}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors cursor-pointer text-sm font-medium"
            title="Copy Username"
        >
            <span>@{username}</span>
            {copied ? (
                <CheckIcon className="w-3.5 h-3.5 text-green-500" />
            ) : (
                <DocumentDuplicateIcon className="w-3.5 h-3.5 opacity-50" />
            )}
        </button>
    );
}

const Stat = ({ value, label, href }: { value: number; label: string; href: string }) => (
    <Link href={href} className="flex flex-col md:flex-row items-center md:gap-1 group cursor-pointer">
        <span className="font-bold text-lg md:text-base text-zinc-900 dark:text-zinc-100 group-hover:opacity-80">
            {value}
        </span>
        <span className="text-sm md:text-base text-zinc-500 capitalize group-hover:underline decoration-zinc-400 underline-offset-4">
            {label}
        </span>
    </Link>
);

const ActionButton = ({ children, onClick, href }: { children: React.ReactNode, onClick?: () => void, href?: string }) => {
    const className = "flex items-center justify-center w-full md:w-auto px-5 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm font-semibold text-zinc-900 dark:text-zinc-100 transition-colors";

    if (href) {
        return <Link href={href} className={className}>{children}</Link>;
    }
    return <button onClick={onClick} className={className}>{children}</button>;
};

// Reusable Icon Button for Notifications, Saved, More (Used in both Mobile and Desktop)
const IconAction = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => (
    <Link
        href={href}
        className="flex items-center justify-center px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 transition-colors"
        title={label}
    >
        <Icon className="w-5 h-5" />
    </Link>
);

// --- MAIN COMPONENT ---

export default function ProfileHeader({
                                          profile,
                                          isOwnProfile,
                                          isPrivate,
                                          initialFollowStatus,
                                          followerCount,
                                          followingCount,
                                          timelineCount,
                                      }: {
    profile: UserProfile;
    isOwnProfile: boolean;
    isPrivate: boolean;
    initialFollowStatus: 'not_following' | 'pending' | 'accepted';
    followerCount: number;
    followingCount: number;
    timelineCount: number;
}) {
    // 1. Calculate actual join date
    const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    /**
     * 2. Determine NSFW Status
     * Checks the user's content preference.
     */
    const isNsfw = profile.content_preference === 'all';

    return (
        <div className={`w-full bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 ${geistSans.className}`}>
            <div className="max-w-4xl mx-auto px-4 pt-4 pb-8 md:py-10">

                <div className="flex flex-col md:flex-row md:gap-10">

                    {/* --- TOP SECTION: Avatar & Mobile Stats --- */}
                    <div className="grid grid-cols-[auto_1fr] md:flex md:items-start gap-6 md:gap-10 items-center">

                        {/* Avatar */}
                        <div className="relative w-20 h-20 md:w-40 md:h-40 shrink-0">
                            <div className="rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 w-full h-full relative ring-2 ring-white dark:ring-black">
                                {profile.profile_pic_url ? (
                                    <Image
                                        src={profile.profile_pic_url}
                                        alt={profile.display_name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 80px, 160px"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-300 text-3xl md:text-5xl font-medium">
                                        {profile.display_name.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats (Mobile Only) */}
                        <div className="flex md:hidden justify-around items-center w-full pr-2">
                            <Stat value={timelineCount} label="logs" href={`/profile/${profile.username}/timeline`} />
                            <Stat value={followerCount} label="followers" href={`/profile/${profile.username}/followers`} />
                            <Stat value={followingCount} label="following" href={`/profile/${profile.username}/following`} />
                        </div>
                    </div>

                    {/* --- DETAILS SECTION --- */}
                    <div className="flex-1 mt-4 md:mt-0 flex flex-col gap-3">

                        {/* Name & Actions (Desktop) */}
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <h2 className="text-xl md:text-2xl font-bold truncate mr-2">
                                {profile.display_name}
                            </h2>

                            {/* --- DESKTOP ACTIONS --- */}
                            <div className="hidden md:flex gap-2">
                                {isOwnProfile ? (
                                    <>
                                        <ActionButton href="/profile/edit">Edit profile</ActionButton>
                                        <IconAction href="/profile/notifications" icon={BellIcon} label="Notifications" />
                                        <IconAction href="/profile/saved" icon={BookmarkIcon} label="Saved" />
                                        <IconAction href="/profile/more" icon={MdOutlineMoreHoriz} label="More" />
                                    </>
                                ) : (
                                    <div className="w-28">
                                        <FollowButton profileId={profile.id} isPrivate={isPrivate} initialFollowStatus={initialFollowStatus} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Handle & Badge Container */}
                        <div className="-mt-1 flex items-center gap-2">
                            <CopyableHandle username={profile.username} />

                            {/* New UserBadge handles both Role and NSFW */}
                            <UserBadge role={profile.role} isNsfw={isNsfw} />
                        </div>

                        {/* Stats (Desktop Only) */}
                        <div className="hidden md:flex items-center gap-8 py-3">
                            <Stat value={timelineCount} label="logs" href={`/profile/${profile.username}/timeline`} />
                            <Stat value={followerCount} label="followers" href={`/profile/${profile.username}/followers`} />
                            <Stat value={followingCount} label="following" href={`/profile/${profile.username}/following`} />
                        </div>

                        {/* Bio & Meta */}
                        <div className="space-y-3">
                            {profile.bio && (
                                <p className="text-sm whitespace-pre-wrap leading-relaxed max-w-lg text-zinc-800 dark:text-zinc-200">
                                    {profile.bio}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                                {profile.country && (
                                    <div className="flex items-center gap-1">
                                        <MapPinIcon className="w-3.5 h-3.5" />
                                        <span>{profile.country}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    <span>Joined {joinDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* --- MOBILE ACTIONS --- */}
                        <div className="md:hidden mt-2">
                            {isOwnProfile ? (
                                <div className="flex gap-2 w-full">
                                    {/* Edit Button takes remaining space */}
                                    <div className="flex-1">
                                        <ActionButton href="/profile/edit">Edit profile</ActionButton>
                                    </div>
                                    <IconAction href="/profile/notifications" icon={BellIcon} label="Notifications" />
                                    <IconAction href="/profile/saved" icon={BookmarkIcon} label="Saved" />
                                    <IconAction href="/profile/more" icon={MdOutlineMoreHoriz} label="More" />
                                </div>
                            ) : (
                                <FollowButton profileId={profile.id} isPrivate={isPrivate} initialFollowStatus={initialFollowStatus} />
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}