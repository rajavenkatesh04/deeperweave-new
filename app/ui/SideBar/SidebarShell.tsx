'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function SidebarShell({ children }: { children: React.ReactNode }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <aside
            data-expanded={isExpanded ? 'true' : 'false'}
            className="hidden h-dvh fixed top-0 left-0 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black md:flex md:w-20 data-[expanded=true]:w-72 lg:hover:w-72 transition-[width] duration-500 ease-in-out overflow-hidden group/sidebar z-50 shadow-xl"
        >
            {/* Toggle button — tablet only (md), hidden on desktop (lg+) */}
            <button
                onClick={() => setIsExpanded(prev => !prev)}
                className="lg:hidden absolute top-8 right-3 z-20 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
                {isExpanded
                    ? <ChevronLeft className="w-4 h-4" />
                    : <ChevronRight className="w-4 h-4" />
                }
            </button>

            {children}
        </aside>
    );
}