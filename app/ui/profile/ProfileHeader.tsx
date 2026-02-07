'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Profile } from '@/lib/definitions';
import {
    MapPinIcon,
    CalendarIcon,
    CheckIcon,
    DocumentDuplicateIcon,
    BellIcon,
    BookmarkIcon
} from '@heroicons/react/24/outline';
import { MdOutlineMoreHoriz } from "react-icons/md";
import { format } from 'date-fns';
import FollowButton from "@/app/ui/profile/FollowButton";
import UserBadge from "@/app/ui/profile/UserBadge";

// --- REUSABLE HELPER COMPONENTS ---

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
        >
            <span>@{username}</span>
            {copied ? <CheckIcon className="w-3.5 h-3.5 text-green-500" /> : <DocumentDuplicateIcon className="w-3.5 h-3.5 opacity-50" />}
        </button>
    );
}

const ActionButton = ({ children, href }: { children: React.ReactNode, href: string }) => (
    <Link href={href} className="flex items-center justify-center w-full md:w-auto px-5 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm font-semibold text-zinc-900 dark:text-zinc-100 transition-colors">
        {children}
    </Link>
);

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

interface ProfileHeaderProps {
    profile: Profile;
    isOwnProfile: boolean;
    initialIsFollowing?: boolean;
    statsSlot: React.ReactNode;
}

export function ProfileHeader({
                                  profile,
                                  isOwnProfile,
                                  initialIsFollowing,
                                  statsSlot,
                              }: ProfileHeaderProps) {

    const joinDate = profile.created_at
        ? format(new Date(profile.created_at), 'MMMM yyyy')
        : 'Unknown';

    const isNsfw = profile.content_preference === 'all';

    return (
        <div className="w-full bg-white dark:bg-black text-zinc-900 dark:text-zinc-100">
            <div className="max-w-4xl mx-auto px-4 pt-4 pb-8 md:py-10">
                <div className="flex flex-col md:flex-row md:gap-10">

                    {/* 1. LEFT: AVATAR & MOBILE STATS */}
                    <div className="grid grid-cols-[auto_1fr] md:flex md:items-start gap-4 md:gap-10 items-center">
                        {/* Avatar */}
                        <div className="relative w-20 h-20 md:w-40 md:h-40 shrink-0">
                            <div className="rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 w-full h-full relative ring-2 ring-white dark:ring-black">
                                {profile.avatar_url ? (
                                    <Image
                                        src={profile.avatar_url}
                                        alt={profile.username || 'User'}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 80px, 160px"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-3xl md:text-5xl font-medium">
                                        {profile.full_name?.[0]}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* STATS (Mobile Slot) */}
                        {/* UPDATE: Removed 'justify-around' here. The child component handles alignment now. */}
                        <div className="flex md:hidden items-center w-full pl-2">
                            {statsSlot}
                        </div>
                    </div>

                    {/* 2. RIGHT: DETAILS */}
                    <div className="flex-1 mt-4 md:mt-0 flex flex-col gap-3">

                        {/* Desktop Header Row */}
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <h2 className="text-xl md:text-2xl font-bold truncate mr-2">
                                {profile.full_name}
                            </h2>

                            {/* Desktop Actions */}
                            <div className="hidden md:flex gap-2">
                                {isOwnProfile ? (
                                    <>
                                        <ActionButton href="/profile/edit">Edit profile</ActionButton>
                                        <IconAction href="/profile/notifications" icon={BellIcon} label="Notifications" />
                                        <IconAction href="/profile/saved" icon={BookmarkIcon} label="Saved" />
                                        <IconAction href="/profile/more" icon={MdOutlineMoreHoriz} label="More" />
                                    </>
                                ) : (
                                    <div className="w-32">
                                        <FollowButton
                                            targetUserId={profile.id}
                                            initialIsFollowing={initialIsFollowing ?? false}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Handle & Badge */}
                        <div className="-mt-1 flex items-center gap-2">
                            <CopyableHandle username={profile.username || ''} />
                            <UserBadge role={profile.role} isNsfw={isNsfw} />
                        </div>

                        {/* STATS (Desktop Slot) */}
                        {/* This remains visible only on md+ */}
                        <div className="hidden md:block py-3">
                            {statsSlot}
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

                        {/* Mobile Actions (Bottom) */}
                        <div className="md:hidden mt-2">
                            {isOwnProfile ? (
                                <div className="flex gap-2 w-full">
                                    <div className="flex-1">
                                        <ActionButton href="/profile/edit">Edit profile</ActionButton>
                                    </div>
                                    <IconAction href="/profile/notifications" icon={BellIcon} label="Notifications" />
                                    <IconAction href="/profile/saved" icon={BookmarkIcon} label="Saved" />
                                    <IconAction href="/profile/more" icon={MdOutlineMoreHoriz} label="More" />
                                </div>
                            ) : (
                                <FollowButton
                                    targetUserId={profile.id}
                                    initialIsFollowing={initialIsFollowing ?? false}
                                    className="w-full"
                                />
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}