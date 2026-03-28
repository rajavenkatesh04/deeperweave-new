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
                        className="relative flex h-full w-16 flex-col items-center justify-center"
                    >
                        <motion.div
                            whileTap={{ scale: 0.88 }}
                            className={cn(
                                'relative flex items-center justify-center w-12 h-12 rounded-2xl transition-colors duration-200',
                                isActive
                                    ? 'text-zinc-900 dark:text-zinc-100'
                                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300',
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="mobile-nav-pill"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 rounded-2xl shadow-sm"
                                />
                            )}
                            <Icon
                                className="relative z-10 size-5.5"
                                strokeWidth={isActive ? 2.2 : 1.75}
                            />
                        </motion.div>
                    </Link>
                );
            })}
        </LayoutGroup>
    );
}
