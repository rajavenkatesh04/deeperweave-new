'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
// Importing Material Design Outline icons
import {
    MdOutlineMenuBook,      // Blogs
    MdOutlineExplore,       // Explore (New)
    MdOutlineHome,          // Discover
    MdOutlineSearch,        // Search
    MdOutlineNotifications, // Notifications
    MdOutlineBookmark       // Saved
} from 'react-icons/md';

const links = [
    { name: 'Discover', href: '/discover', icon: MdOutlineHome },
    { name: 'Search', href: '/search', icon: MdOutlineSearch },
    { name: 'Explore', href: '/explore', icon: MdOutlineExplore },
    { name: 'Blogs', href: '/blog', icon: MdOutlineMenuBook },
];

export default function DesktopNavLinks() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col space-y-2">
            {links.map((link) => {
                const LinkIcon = link.icon;
                const isActive = pathname === link.href;

                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={clsx(
                            // Fixed height, fixed padding-left. Icon never moves.
                            'group relative flex items-center h-12 px-4 rounded-md transition-colors duration-200 overflow-hidden',
                            {
                                'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100': isActive,
                                'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50': !isActive,
                            },
                        )}
                    >
                        {/* Icon - Pinned width to ensure text starts at exact same spot */}
                        <div className="shrink-0 flex items-center justify-center w-6 h-6 mr-4">
                            <LinkIcon className={clsx("h-6 w-6 transition-colors", {
                                "text-zinc-900 dark:text-zinc-100": isActive,
                                "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300": !isActive
                            })} />
                        </div>

                        {/* Text - Added delay-200 to sync with sidebar expansion */}
                        <span className={clsx(
                            "whitespace-nowrap font-medium text-sm tracking-wide transition-all duration-300 ease-in-out delay-200",
                            // Start slightly to the left and invisible
                            "opacity-0 -translate-x-4",
                            // On hover, slide right and fade in
                            "group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0"
                        )}>
                            {link.name}
                        </span>

                        {/* Active Indicator (Left Border replacement) */}
                        {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-zinc-900 dark:bg-zinc-100 rounded-r-full" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}