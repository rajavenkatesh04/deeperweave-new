'use client';

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
    DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { MdOutlineMoreHoriz } from "react-icons/md";
import { format } from 'date-fns';
import FollowButton from "@/app/ui/profile/FollowButton";
import UserBadge from "@/app/ui/profile/UserBadge";
import { toast } from "sonner";

// Shadcn Imports
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogDescription
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
import {ArrowRightOnRectangleIcon} from "@heroicons/react/20/solid";

// --- REUSABLE HELPER COMPONENTS ---

function CopyableHandle({ username, className, showIcon = true }: { username: string, className?: string, showIcon?: boolean }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(`@${username}`);
        // Simple visual feedback or toast
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

const DrawerMenuItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => (
    <Link href={href} className="flex items-center gap-4 w-full p-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
        <Icon className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
        <span className="text-lg font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
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

            {/* --- MOBILE NAVBAR (Sticky Top) --- */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-md">
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className="font-bold text-lg truncate">@{profile.username}</span>
                    <UserBadge role={profile.role} isNsfw={isNsfw} />
                </div>

                <Drawer>
                    <DrawerTrigger asChild>
                        <button className="p-1 -mr-2 text-zinc-900 dark:text-zinc-100">
                            <Bars3Icon className="w-7 h-7" />
                        </button>
                    </DrawerTrigger>
                    <DrawerContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                        <DrawerHeader>
                            <DrawerTitle className="text-center">@{profile.username}</DrawerTitle>
                            <DrawerDescription className="sr-only">Menu</DrawerDescription>
                        </DrawerHeader>

                        <div className="px-4 pb-20 space-y-2">
                            {isOwnProfile ? (
                                <>
                                    <DrawerMenuItem href="/profile/notifications" icon={BellIcon} label="Notifications" />
                                    <DrawerMenuItem href="/profile/saved" icon={BookmarkIcon} label="Saved" />
                                    <DrawerMenuItem href="/profile/settings" icon={Cog6ToothIcon} label="Settings" />

                                    <Separator className="my-4 bg-zinc-200 dark:bg-zinc-800" />

                                    <SignOutButton className="flex items-center gap-4 w-full p-4 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors text-red-600 dark:text-red-500">
                                        <ArrowRightOnRectangleIcon className="w-6 h-6" />
                                        <span className="text-lg font-medium">Sign out</span>
                                    </SignOutButton>
                                </>
                            ) : (
                                <>
                                    <DrawerMenuItem href="#" icon={BellIcon} label="Turn on Notifications" />
                                    <div className="p-4 text-center text-zinc-500 text-sm">More options coming soon</div>
                                </>
                            )}
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>

            <div className="max-w-4xl mx-auto px-4 pt-4 pb-8 md:py-10">
                <div className="flex flex-col md:flex-row md:gap-10">

                    {/* 1. LEFT: AVATAR & STATS */}
                    <div className="grid grid-cols-[auto_1fr] md:flex md:items-start gap-5 md:gap-10 items-center">

                        {/* Avatar */}
                        {profile.avatar_url ? (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div className="relative w-28 h-28 md:w-40 md:h-40 shrink-0 cursor-pointer group">
                                        <div className="rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 w-full h-full relative ring-2 ring-white dark:ring-black">
                                            <Image
                                                src={profile.avatar_url}
                                                alt={profile.username || 'User'}
                                                fill
                                                className="object-cover transition-opacity group-hover:opacity-90"
                                                sizes="(max-width: 768px) 112px, 160px"
                                                priority
                                            />
                                        </div>
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px] p-0 bg-transparent border-none shadow-none flex items-center justify-center">
                                    <DialogTitle className="sr-only">Profile Picture</DialogTitle>
                                    <DialogDescription className="sr-only">Expanded view</DialogDescription>
                                    <div className="relative w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full overflow-hidden ring-4 ring-white/10 shadow-2xl">
                                        <Image
                                            src={profile.avatar_url}
                                            alt={profile.username || 'User'}
                                            fill
                                            className="object-cover"
                                            quality={95}
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ) : (
                            <div className="relative w-28 h-28 md:w-40 md:h-40 shrink-0">
                                <div className="rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 w-full h-full relative ring-2 ring-white dark:ring-black">
                                    <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-3xl md:text-5xl font-medium">
                                        {profile.full_name?.[0]}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STATS (Mobile Slot - Beside Avatar) */}
                        <div className="flex md:hidden items-center w-full">
                            {statsSlot}
                        </div>
                    </div>

                    {/* 2. RIGHT: DETAILS */}
                    <div className="flex-1 mt-4 md:mt-0 flex flex-col gap-3">

                        {/* Name Row */}
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
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
                                        <IconAction href="/profile/settings" icon={MdOutlineMoreHoriz} label="Settings" />
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

                        {/* Handle (Mobile & Desktop) */}
                        <div className="-mt-1 flex items-center gap-2">
                            <CopyableHandle
                                username={profile.username || ''}
                                showIcon={false} // Clean look, no icon
                                className="text-sm md:text-base text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                            />
                            {/* Desktop Badge only (Mobile has it in navbar) */}
                            <div className="hidden md:block">
                                <UserBadge role={profile.role} isNsfw={isNsfw} />
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="space-y-4 mt-1">
                            {profile.bio && (
                                <p className="text-sm whitespace-pre-wrap leading-relaxed max-w-lg text-zinc-800 dark:text-zinc-200">
                                    {profile.bio}
                                </p>
                            )}

                            {/* Modern Metadata Pills */}
                            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                {profile.country && (
                                    <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full">
                                        <MapPinIcon className="w-3.5 h-3.5" />
                                        <span>{profile.country}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full">
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    <span>Joined {joinDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* STATS (Desktop Slot) */}
                        <div className="hidden md:block py-3">
                            {statsSlot}
                        </div>

                        {/* Mobile Actions (Full Width Bottom) */}
                        <div className="md:hidden mt-4">
                            {isOwnProfile ? (
                                <ActionButton href="/profile/edit">Edit profile</ActionButton>
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