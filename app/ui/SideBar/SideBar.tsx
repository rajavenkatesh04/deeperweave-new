import Link from 'next/link';
import Image from 'next/image';
import DesktopNavLinks from '@/app/ui/SideBar/DesktopNavLinks';
import MobileNavLinks from '@/app/ui/SideBar/MobileNavLinks';
import UserProfile from "@/app/ui/SideBar/user-profile";
import { PlayWriteNewZealandFont } from "@/app/ui/shared/fonts";

import { Profile } from "@/lib/definitions";
import {createClient} from "@/lib/supabase/server"; // Import this

export default async function SideBar() {
    // 1. Initialize Supabase
    const supabase = await createClient();

    // 2. Fetch User Session (Decrypts cookie, no DB cost)
    const { data: { user } } = await supabase.auth.getUser();

    // 3. Construct the Profile object directly here
    let profile: Profile | null = null;

    if (user && user.user_metadata?.username) {
        profile = {
            id: user.id,
            username: user.user_metadata.username,
            full_name: user.user_metadata.full_name,
            avatar_url: user.user_metadata.avatar_url,
        } as Profile;
    }

    return (
        <>
            {/* ====== DESKTOP SIDEBAR ====== */}
            <aside className="hidden h-[100dvh] fixed top-0 left-0 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black md:flex md:w-20 md:hover:w-72 transition-[width] duration-500 ease-in-out overflow-hidden group/sidebar z-50 shadow-xl">

                {/* Texture Background */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />

                {/* Logo Section */}
                <div className="relative z-10 flex-none h-24 flex items-center px-5 border-b border-zinc-200 dark:border-zinc-800 whitespace-nowrap overflow-hidden">
                    <Link href="/" className="flex items-center gap-4 group/logo">
                        <div className="relative h-10 w-10 flex-shrink-0">
                            <Image
                                src="https://jyjynjpznlvezjhnuwhi.supabase.co/storage/v1/object/public/website_assests/icon-512x512.png"
                                alt="Deeper Weave Logo"
                                width={40}
                                height={40}
                                className="rounded-xl object-cover shadow-sm "
                                priority
                            />
                        </div>
                        <div className="flex flex-col opacity-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 transition-all duration-300 ease-out delay-200">
                            <p className={`${PlayWriteNewZealandFont.className} text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-none`}>
                                DeeperWeave
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Nav Links */}
                <div className="relative z-10 flex-1 py-8 px-3 overflow-y-auto overflow-x-hidden">
                    <DesktopNavLinks />
                </div>

                {/* User Profile (Data Passed Down) */}
                <div className="relative z-10 flex-none p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm whitespace-nowrap overflow-hidden">
                    <UserProfile profile={profile} />
                </div>
            </aside>

            {/* ====== MOBILE BOTTOM BAR ====== */}
            <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 md:hidden pb-safe">
                <div className="flex h-full items-center justify-around px-2">
                    <MobileNavLinks />

                    {/* Mobile Profile Link */}
                    <Link
                        href={profile?.username ? `/profile/${profile.username}` : "/auth/login"}
                        className="flex flex-col items-center justify-center w-16 h-full gap-1 group"
                    >
                        <div className="relative h-6 w-6 overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-sm rotate-45 group-hover:rotate-0 transition-transform duration-300">
                            {profile?.avatar_url ? (
                                <Image
                                    src={profile.avatar_url}
                                    alt={'Profile'}
                                    className="object-cover"
                                    fill
                                    sizes="24px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-500">
                                    {profile?.full_name?.[0] || '?'}
                                </div>
                            )}
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}