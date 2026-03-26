'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, LayoutGroup } from 'framer-motion';
import { Clapperboard, Search, Compass, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const links: { name: string; href: string; icon: LucideIcon }[] = [
    { name: 'Discover', href: '/discover', icon: Clapperboard },
    { name: 'Search',   href: '/search',   icon: Search },
    { name: 'Explore',  href: '/explore',  icon: Compass },
    { name: 'Blogs',    href: '/blogs',    icon: BookOpen },
];

export default function MobileNavLinks() {
    const pathname = usePathname();

    return (
        <LayoutGroup id="mobile-nav">
            {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;

                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className="relative flex h-full w-16 flex-col items-center justify-center gap-1"
                    >
                        {/* Icon pill */}
                        <motion.div
                            whileTap={{ scale: 0.86 }}
                            className={cn(
                                'relative flex items-center justify-center w-11 h-8 rounded-xl transition-colors duration-200',
                                isActive
                                    ? 'text-zinc-900 dark:text-zinc-100'
                                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300',
                            )}
                        >
                            {/* Sliding background pill */}
                            {isActive && (
                                <motion.div
                                    layoutId="mobile-nav-pill"
                                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                    className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 rounded-xl"
                                />
                            )}

                            <Icon
                                className="relative z-10 size-5"
                                strokeWidth={isActive ? 2.25 : 1.75}
                            />
                        </motion.div>

                        {/* Label — always reserves space, only visible when active */}
                        <span
                            className={cn(
                                'text-[10px] font-medium leading-none transition-all duration-200',
                                isActive
                                    ? 'text-zinc-900 dark:text-zinc-100 opacity-100 translate-y-0'
                                    : 'text-zinc-400 opacity-0 -translate-y-0.5',
                            )}
                        >
                            {link.name}
                        </span>
                    </Link>
                );
            })}
        </LayoutGroup>
    );
}
