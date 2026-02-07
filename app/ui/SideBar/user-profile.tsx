import Link from 'next/link';
import Image from 'next/image';
import { PowerIcon } from '@heroicons/react/24/outline';

import { Profile } from "@/lib/definitions";
import SignOutButton from "@/app/ui/shared/SignOutButton";

export default function UserProfile({ profile }: { profile: Profile | null }) {
    // Guest State (Not Logged In)
    if (!profile) {
        return (
            <Link
                href="/auth/login"
                className="flex items-center h-14 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group/login w-full"
            >
                <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 rounded-full mr-3">
                    <PowerIcon className="h-5 w-5 text-zinc-500 group-hover/login:text-zinc-900 dark:group-hover/login:text-zinc-100 transition-colors" />
                </div>
                {/* Sidebar Expansion Logic */}
                <span className="opacity-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 transition-all duration-300 delay-200 whitespace-nowrap text-sm font-bold text-zinc-700 dark:text-zinc-200">
                    Sign In
                </span>
            </Link>
        );
    }

    // Logged In State
    return (
        <div className="relative w-full h-14 group/user">

            {/* --- LAYER 1: Default View (Avatar + Name) --- */}
            <div className="absolute inset-0 flex items-center px-2 transition-all duration-300 group-hover/user:opacity-0 group-hover/user:scale-95">
                {/* Avatar */}
                <div className="shrink-0 relative h-10 w-10 mr-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                        {profile.avatar_url ? (
                            <Image
                                src={profile.avatar_url}
                                alt={profile.username || 'User'}
                                fill
                                className="object-cover"
                                sizes="40px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold">
                                {profile.full_name?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
                {/* Text Details */}
                <div className="flex flex-col opacity-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 transition-all duration-300 delay-200">
                    <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100 w-32">
                        {profile.full_name}
                    </p>
                    <p className="truncate text-xs text-zinc-500 w-32">
                        @{profile.username}
                    </p>
                </div>
            </div>

            {/* --- LAYER 2: Hover Split View (The Pill) --- */}
            <div className="absolute inset-0 flex items-center opacity-0 scale-95 pointer-events-none group-hover/user:pointer-events-auto group-hover/user:opacity-100 group-hover/user:scale-100 transition-all duration-300 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg overflow-hidden">

                {/* LEFT HALF: Profile Link */}
                <Link
                    href={`/profile/${profile.username}`}
                    className="flex-1 h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group/left"
                    title="View Profile"
                >
                    <div className="relative w-6 h-6">
                        {profile.avatar_url ? (
                            <Image
                                src={profile.avatar_url}
                                alt="Profile"
                                className="rounded-full object-cover opacity-80 group-hover/left:opacity-100"
                                fill
                                sizes="24px"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                                {profile.full_name?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>
                </Link>

                {/* CENTER DIVIDER */}
                <div className="w-px h-full bg-zinc-200 dark:bg-zinc-800" />

                {/* RIGHT HALF: Logout Button Wrapper */}
                <div className="flex-1 h-full">
                    <SignOutButton className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors group/right">
                        <PowerIcon className="w-5 h-5 text-zinc-400 group-hover/right:text-red-500 transition-colors" />
                    </SignOutButton>
                </div>
            </div>
        </div>
    );
}