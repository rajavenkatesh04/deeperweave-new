'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { motion, LayoutGroup } from 'framer-motion';
import {
    MdOutlineHome,
    MdOutlineHistory,
    MdOutlineFormatListBulleted,
    MdOutlineArticle,
    MdOutlineInsights
} from 'react-icons/md';

// --- Configuration ---

type TabConfigItem = {
    icon: React.ElementType;
    color: string;
};

const TAB_CONFIG: Record<string, TabConfigItem> = {
    Home: {
        icon: MdOutlineHome,
        color: 'text-violet-600 dark:text-violet-400' // Violet for Home
    },
    Reviews: {
        icon: MdOutlineHistory,
        color: 'text-blue-600 dark:text-blue-400'
    },
    Lists: {
        icon: MdOutlineFormatListBulleted,
        color: 'text-pink-600 dark:text-pink-400'
    },
    Posts: {
        icon: MdOutlineArticle,
        color: 'text-teal-600 dark:text-teal-400'
    },
    Analytics: {
        icon: MdOutlineInsights,
        color: 'text-emerald-600 dark:text-emerald-400'
    },
};

export default function TabNavigation({ username }: { username: string }) {
    const pathname = usePathname();
    const baseUrl = `/profile/${username}`;

    const tabs = [
        { name: 'Home', href: `${baseUrl}/home` },
        { name: 'Reviews', href: `${baseUrl}/reviews` },
        { name: 'Lists', href: `${baseUrl}/lists` },
        { name: 'Posts', href: `${baseUrl}/posts` },
        { name: 'Analytics', href: `${baseUrl}/analytics` },
    ];

    return (
        <div className="z-30 w-full bg-gray-50 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
            <div className="max-w-4xl mx-auto px-2 md:px-4">
                <LayoutGroup>
                    <nav
                        className="flex items-center h-14 w-full overflow-x-auto scrollbar-hide gap-1 md:gap-2"
                        aria-label="Profile Sections"
                    >
                        {tabs.map((tab) => {
                            const isActive = pathname === tab.href;
                            const config = TAB_CONFIG[tab.name];
                            const Icon = config.icon;

                            return (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    className="relative flex-1 min-w-[60px] h-10 group outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 rounded-full"
                                >
                                    <motion.div
                                        whileTap={{ scale: 0.95 }}
                                        className={clsx(
                                            "relative w-full h-full flex items-center justify-center gap-2 rounded-full px-3 py-1.5 transition-colors duration-300",
                                            isActive
                                                ? config.color
                                                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                                        )}
                                    >
                                        {/* Icon */}
                                        <Icon className="w-5 h-5 md:w-4 md:h-4 relative z-10" />

                                        {/* Label */}
                                        <span className="hidden md:block text-xs md:text-sm font-bold tracking-wide uppercase relative z-10">
                                            {tab.name}
                                        </span>

                                        {/* Active State Background (The Pill) */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-tab-pill"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 30
                                                }}
                                                className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800/80 rounded-full shadow-sm"
                                            />
                                        )}

                                        {/* Hover State Background */}
                                        {!isActive && (
                                            <div className="absolute inset-0 rounded-full bg-zinc-100/50 dark:bg-zinc-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                        )}
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </nav>
                </LayoutGroup>
            </div>
        </div>
    );
}