'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { motion, LayoutGroup } from 'framer-motion';
import {
    MdOutlineHome, MdHome,
    MdOutlineSearch, MdSearch,
    MdOutlineExplore, MdExplore, // New Icons
    MdOutlineMenuBook, MdMenuBook
} from 'react-icons/md';

// --- Configuration ---
const links = [
    {
        name: 'Discover',
        href: '/discover',
        icon: MdOutlineHome,
        solidIcon: MdHome
    },
    {
        name: 'Search',
        href: '/search',
        icon: MdOutlineSearch,
        solidIcon: MdSearch
    },
    {
        name: 'Explore', // Renamed from Create
        href: '/explore',
        icon: MdOutlineExplore, // Compass Icon
        solidIcon: MdExplore
    },
    {
        name: 'Blogs',
        href: '/blog',
        icon: MdOutlineMenuBook,
        solidIcon: MdMenuBook
    },
];

// Optional: specific accent colors for each tab
const ACCENT_COLORS: Record<string, string> = {
    Discover: 'text-purple-600 dark:text-purple-400',
    Search: 'text-blue-600 dark:text-blue-400',
    Explore: 'text-teal-600 dark:text-teal-400', // Updated color for Explore
    Blogs: 'text-orange-600 dark:text-orange-400',
};

export default function MobileNavLinks() {
    const pathname = usePathname();

    return (
        // LayoutGroup enables the shared layout animation across different components
        <LayoutGroup id="mobile-nav-links">
            {links.map((link) => {
                const isActive = pathname === link.href;
                // Dynamically select the Solid or Outline icon
                const LinkIcon = isActive ? link.solidIcon : link.icon;
                const activeColorClass = ACCENT_COLORS[link.name] || 'text-zinc-900 dark:text-zinc-100';

                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className="relative flex h-full w-16 flex-col items-center justify-center"
                    >
                        <motion.div
                            // Tactile feedback: scale down slightly on tap
                            whileTap={{ scale: 0.9 }}
                            className={clsx(
                                "relative w-12 h-12 flex items-center justify-center rounded-2xl transition-colors duration-200",
                                isActive
                                    ? activeColorClass
                                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            )}
                        >
                            {/* --- THE MAGIC: SLIDING BACKGROUND PILL --- */}
                            {isActive && (
                                <motion.div
                                    layoutId="mobile-nav-pill"
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30
                                    }}
                                    className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl shadow-sm"
                                />
                            )}

                            {/* Icon (Relative z-10 to sit on top of the pill) */}
                            <LinkIcon className="relative z-10 h-6 w-6" />

                            {/* Hover Effect (Subtle glow when NOT active) */}
                            {!isActive && (
                                <div className="absolute inset-0 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/30 opacity-0 hover:opacity-100 transition-opacity duration-200" />
                            )}
                        </motion.div>
                    </Link>
                );
            })}
        </LayoutGroup>
    );
}