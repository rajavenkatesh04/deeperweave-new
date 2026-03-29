'use client';

import type { FC, ReactNode } from 'react';
import { Dialog as DialogPrimitive } from "radix-ui";
import Link from 'next/link';
import Image from 'next/image';
import { Profile } from '@/lib/definitions';
import {
    MapPinIcon,
    CalendarIcon,
    BellIcon,
    BookmarkIcon,
    Bars3Icon,
    Cog6ToothIcon,
    DocumentDuplicateIcon,
    PencilSquareIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { MdOutlineMoreHoriz } from "react-icons/md";
import { format } from 'date-fns';
import FollowButton from "@/app/ui/profile/FollowButton";
import UserBadge from "@/app/ui/profile/UserBadge";
import { toast } from "sonner";

import {
    Dialog,
    DialogTrigger,
    DialogTitle,
    DialogDescription,
    DialogOverlay,
    DialogPortal
} from "@/components/ui/dialog";

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import SignOutButton from "@/app/ui/shared/SignOutButton";

// --- TYPES ---

type IconComponent = FC<{ className?: string }>;

// --- REUSABLE HELPER COMPONENTS ---

function CopyableHandle({ username, className, showIcon = true }: { username: string, className?: string, showIcon?: boolean }) {
    const handleCopy = () => {
        void navigator.clipboard.writeText(`@${username}`);
        toast.success("Copied to clipboard");
    };

    return (
        <button
            onClick={handleCopy}
            className={`group flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors cursor-pointer font-medium ${className}`}
            title="Click to copy"
        >
            <span>@{username}</span>
            {showIcon && (
                <DocumentDuplicateIcon className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
            )}
        </button>
    );
}

const IconAction = ({ href, icon: Icon, label }: { href: string, icon: IconComponent, label: string }) => (
    <Link
        href={href}
        className="flex items-center justify-center px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 transition-colors"
        title={label}
    >
        <Icon className="w-4 h-4" />
    </Link>
);

const DrawerMenuItem = ({ href, icon: Icon, label }: { href: string, icon: IconComponent, label: string }) => (
    <Link href={href} className="flex items-center gap-3 w-full px-3 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
        <Icon className="w-[18px] h-[18px] text-zinc-500 dark:text-zinc-400 shrink-0" />
        <span className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
    </Link>
);

// --- MAIN COMPONENT ---

interface ProfileHeaderProps {
    profile: Profile;
    isOwnProfile: boolean;
    initialIsFollowing?: boolean;
    statsSlot: ReactNode;
}

export function ProfileHeader({
                                  profile,
                                  isOwnProfile,
                                  initialIsFollowing,
                                  statsSlot,
                              }: ProfileHeaderProps) {

    const joinDate = profile.created_at
        ? format(new Date(profile.created_at), 'MMMM yyyy')
        : null;

    const isNsfw = profile.content_preference === 'all';

    const avatarNode = profile.avatar_url ? (
        <Dialog>
            <DialogTrigger asChild>
                <div className="relative w-24 h-24 md:w-40 md:h-40 shrink-0 cursor-pointer group">
                    <div className="rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 w-full h-full relative ring-2 ring-white dark:ring-black">
                        <Image
                            src={profile.avatar_url}
                            alt={profile.username || 'User'}
                            fill
                            className="object-cover transition-opacity group-hover:opacity-90"
                            sizes="(max-width: 768px) 96px, 176px"
                            priority
                        />
                    </div>
                </div>
            </DialogTrigger>
            <DialogPortal>
                <DialogOverlay className="bg-black/40 backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
                <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200">
                    <DialogTitle className="sr-only">Profile Picture</DialogTitle>
                    <DialogDescription className="sr-only">Expanded view</DialogDescription>
                    <div className="relative w-75 h-75 sm:w-125 sm:h-125 rounded-full overflow-hidden ring-4 ring-white/10 shadow-2xl">
                        <Image
                            src={profile.avatar_url}
                            alt={profile.username || 'User'}
                            fill
                            className="object-cover"
                            quality={95}
                        />
                    </div>
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    ) : (
        <div className="relative w-24 h-24 md:w-44 md:h-44 shrink-0">
            <div className="rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 w-full h-full relative ring-2 ring-white dark:ring-black">
                <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-3xl md:text-5xl font-medium">
                    {profile.full_name?.[0]}
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full bg-white dark:bg-black text-zinc-900 dark:text-zinc-100">

            {/* --- MOBILE NAVBAR (Sticky Top) --- */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-md">
                <div className="flex items-center gap-2 overflow-hidden">
                    <button
                        onClick={() => {
                            void navigator.clipboard.writeText(`@${profile.username}`);
                            toast.success("Copied to clipboard");
                        }}
                        className="font-bold text-lg truncate active:opacity-70"
                    >
                        @{profile.username}
                    </button>
                    <UserBadge role={profile.role} isNsfw={isNsfw} />
                </div>

                <Drawer>
                    <DrawerTrigger asChild>
                        <button className="p-1 -mr-2 text-zinc-900 dark:text-zinc-100">
                            <Bars3Icon className="w-6 h-6" />
                        </button>
                    </DrawerTrigger>
                    <DrawerContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                        <DrawerHeader className="pt-4 pb-2">
                            {/* Subtle handle */}
                            <DrawerTitle className="text-center text-xs font-medium text-zinc-400 dark:text-zinc-500">
                                @{profile.username}
                            </DrawerTitle>
                            {/* Location + Joined */}
                            {(profile.country || joinDate) && (
                                <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                    {profile.country && (
                                        <span className="flex items-center gap-1">
                                            <MapPinIcon className="w-3 h-3" />
                                            {profile.country}
                                        </span>
                                    )}
                                    {profile.country && joinDate && (
                                        <span className="text-zinc-300 dark:text-zinc-700">·</span>
                                    )}
                                    {joinDate && (
                                        <span className="flex items-center gap-1">
                                            <CalendarIcon className="w-3 h-3" />
                                            Joined {joinDate}
                                        </span>
                                    )}
                                </div>
                            )}
                            <DrawerDescription className="sr-only">Menu</DrawerDescription>
                        </DrawerHeader>

                        <Separator className="mb-1 bg-zinc-100 dark:bg-zinc-800" />

                        <div className="px-3 pb-8 space-y-0.5">
                            {isOwnProfile ? (
                                <>
                                    <DrawerMenuItem href="/profile/notifications" icon={BellIcon} label="Notifications" />
                                    <DrawerMenuItem href="/profile/saved" icon={BookmarkIcon} label="Saved" />
                                    <DrawerMenuItem href="/profile/settings" icon={Cog6ToothIcon} label="Settings" />

                                    <Separator className="my-2 bg-zinc-100 dark:bg-zinc-800" />

                                    <SignOutButton className="flex items-center gap-3 w-full px-3 py-3 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors text-red-600 dark:text-red-500">
                                        <ArrowRightOnRectangleIcon className="w-[18px] h-[18px] shrink-0" />
                                        <span className="text-[15px] font-medium">Sign out</span>
                                    </SignOutButton>
                                </>
                            ) : (
                                <>
                                    <DrawerMenuItem href="#" icon={BellIcon} label="Turn on Notifications" />
                                    <div className="px-3 py-3 text-[13px] text-zinc-400">More options coming soon</div>
                                </>
                            )}
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>

            <div className="max-w-4xl mx-auto px-4 pt-4 pb-2 md:py-10">
                <div className="flex flex-col md:flex-row md:gap-10">

                    {/* LEFT COLUMN */}
                    <div className="flex items-center gap-5 md:flex-col md:items-center md:gap-3 md:w-44 md:shrink-0">

                        {/* Avatar */}
                        {avatarNode}

                        {/* Mobile: Name + Stats beside avatar */}
                        <div className="md:hidden flex flex-col gap-1 min-w-0 flex-1">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 truncate leading-tight">
                                {profile.full_name}
                            </h2>
                            <div className="w-full text-zinc-600 dark:text-zinc-400">
                                {statsSlot}
                            </div>
                        </div>

                        {/* Desktop: 4 icon actions in one row below avatar */}
                        <div className="hidden md:flex gap-2">
                            {isOwnProfile ? (
                                <>
                                    <IconAction href="/profile/edit" icon={PencilSquareIcon} label="Edit profile" />
                                    <IconAction href="/profile/notifications" icon={BellIcon} label="Notifications" />
                                    <IconAction href="/profile/saved" icon={BookmarkIcon} label="Saved" />
                                    <IconAction href="/profile/settings" icon={MdOutlineMoreHoriz as IconComponent} label="Settings" />
                                </>
                            ) : (
                                <div className="w-44">
                                    <FollowButton
                                        targetUserId={profile.id}
                                        initialIsFollowing={initialIsFollowing ?? false}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="flex-1 mt-4 md:mt-0 flex flex-col gap-2.5">

                        {/* Name + Handle + Badge (Desktop only) */}
                        <div className="hidden md:block">
                            <h2 className="text-2xl font-bold leading-tight">
                                {profile.full_name}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <CopyableHandle
                                    username={profile.username || ''}
                                    showIcon={false}
                                    className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                                />
                                <UserBadge role={profile.role} isNsfw={isNsfw} />
                            </div>
                        </div>

                        {/* Bio */}
                        {profile.bio && (
                            <p className="text-sm whitespace-pre-wrap leading-relaxed max-w-lg text-zinc-700 dark:text-zinc-300">
                                {profile.bio}
                            </p>
                        )}

                        {/* Metadata — desktop only (mobile sees it in the drawer) */}
                        {(profile.country || joinDate) && (
                            <div className="hidden md:flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-400 dark:text-zinc-500">
                                {profile.country && (
                                    <span className="flex items-center gap-1">
                                        <MapPinIcon className="w-3 h-3 shrink-0" />
                                        {profile.country}
                                    </span>
                                )}
                                {profile.country && joinDate && (
                                    <span className="text-zinc-300 dark:text-zinc-700 select-none">·</span>
                                )}
                                {joinDate && (
                                    <span className="flex items-center gap-1">
                                        <CalendarIcon className="w-3 h-3 shrink-0" />
                                        Joined {joinDate}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Stats (Desktop) */}
                        <div className="hidden md:block pt-1">
                            {statsSlot}
                        </div>

                        {/* Mobile action button */}
                        <div className="md:hidden mt-3">
                            {isOwnProfile ? (
                                <Link
                                    href="/profile/edit"
                                    className="flex items-center justify-center w-full py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm font-semibold text-zinc-900 dark:text-zinc-100 transition-colors"
                                >
                                    Edit profile
                                </Link>
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
