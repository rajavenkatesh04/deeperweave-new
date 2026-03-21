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

const tabs = (username: string) => [
    { name: 'Home',      href: `/profile/${username}/home`,      icon: MdOutlineHome },
    { name: 'Reviews',   href: `/profile/${username}/reviews`,   icon: MdOutlineHistory },
    { name: 'Lists',     href: `/profile/${username}/lists`,     icon: MdOutlineFormatListBulleted },
    { name: 'Posts',     href: `/profile/${username}/posts`,     icon: MdOutlineArticle },
    { name: 'Analytics', href: `/profile/${username}/analytics`, icon: MdOutlineInsights },
];

export default function TabNavigation({ username }: { username: string }) {
    const pathname = usePathname();
    const tabList = tabs(username);

    return (
        <div className="sticky top-0 z-30 w-full bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800">
            <div className="max-w-4xl mx-auto px-2 md:px-4">
                <LayoutGroup>
                    <nav
                        className="flex items-center h-12 w-full overflow-x-auto scrollbar-hide"
                        aria-label="Profile Sections"
                    >
                        {tabList.map((tab) => {
                            const isActive = pathname === tab.href;
                            const Icon = tab.icon;

                            return (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    className="relative flex-1 min-w-[56px] h-full flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-inset"
                                >
                                    <motion.div
                                        whileTap={{ scale: 0.95 }}
                                        className={clsx(
                                            "flex items-center justify-center gap-1.5 px-2 py-1 transition-colors duration-200",
                                            isActive
                                                ? "text-zinc-900 dark:text-zinc-100"
                                                : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                                        )}
                                    >
                                        <Icon className="w-[18px] h-[18px] shrink-0" />
                                        <span className={clsx(
                                            "hidden sm:block text-xs tracking-wide whitespace-nowrap transition-all duration-200",
                                            isActive ? "font-semibold" : "font-medium"
                                        )}>
                                            {tab.name}
                                        </span>
                                    </motion.div>

                                    {/* Animated underline indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="tab-underline"
                                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-900 dark:bg-zinc-100 rounded-t-full"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </LayoutGroup>
            </div>
        </div>
    );
}