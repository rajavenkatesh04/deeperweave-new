'use client';

import React from 'react';
import {
    Terminal,
    Hammer,
    Headset,
    BadgeCheck,
    ScrollText,
    Bug,
    ShieldAlert,
    LucideIcon
} from 'lucide-react';
import { UserRole } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// --- Configuration ---
type BadgeConfigData = {
    title: string;
    description: string;
    icon: LucideIcon;
    style: string; // Tailwind classes for the Badge
    iconStyle: string; // Tailwind classes for the Icon inside the Modal
};

const BADGE_CONFIG: Record<string, BadgeConfigData> = {
    developer: {
        title: "Core Developer",
        description: "A master architect with direct access to the source code. They build the reality you experience.",
        icon: Terminal,
        style: "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
        iconStyle: "text-amber-600 dark:text-amber-400",
    },
    staff: {
        title: "Staff Member",
        description: "An official architect of the platform. This user helps build, maintain, and curate the experience.",
        icon: Hammer,
        style: "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
        iconStyle: "text-zinc-900 dark:text-zinc-100",
    },
    support: {
        title: "Official Support",
        description: "A verified support specialist dedicated to resolving technical issues and ensuring account security.",
        icon: Headset,
        style: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
        iconStyle: "text-emerald-600 dark:text-emerald-400",
    },
    verified: {
        title: "Verified Account",
        description: "The authentic presence of a notable public figure, creator, or entity.",
        icon: BadgeCheck,
        style: "bg-transparent text-blue-600 hover:bg-blue-50 border-transparent dark:text-blue-400 dark:hover:bg-blue-900/20 p-0",
        iconStyle: "text-blue-600 dark:text-blue-400",
    },
    critic: {
        title: "Verified Critic",
        description: "A recognized voice in criticism. This user provides top-tier analysis and journalistic reviews.",
        icon: ScrollText,
        style: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
        iconStyle: "text-indigo-600 dark:text-indigo-400",
    },
    tester: {
        title: "Beta Tester",
        description: "An elite tester who helps identify bugs, provide feedback, and shape the future through early access.",
        icon: Bug,
        style: "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
        iconStyle: "text-purple-600 dark:text-purple-400",
    },
    nsfw: {
        title: "Sensitive Content",
        description: "This profile may contain content suitable for mature audiences only. Viewer discretion is advised.",
        icon: ShieldAlert,
        style: "bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800 uppercase tracking-wider font-bold text-[10px]",
        iconStyle: "text-rose-600 dark:text-rose-500",
    }
};

// --- Single Badge Component ---
function BadgeItem({ type, config }: { type: string, config: BadgeConfigData }) {
    const Icon = config.icon;
    const isVerified = type === 'verified';
    const isNsfw = type === 'nsfw';

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="focus:outline-none">
                    <Badge
                        variant="outline"
                        className={cn(
                            "transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-sm",
                            config.style,
                            isVerified && "border-none shadow-none hover:scale-110",
                            !isVerified && "px-2.5 py-0.5"
                        )}
                    >
                        {isVerified ? (
                            <Icon className="w-5 h-5 fill-blue-500/10" />
                        ) : (
                            <>
                                {!isNsfw && <Icon className="w-3.5 h-3.5" />}
                                <span>{isNsfw ? 'NSFW' : (type === 'developer' ? 'Dev' : type)}</span>
                            </>
                        )}
                    </Badge>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="flex flex-col items-center text-center gap-4 pt-4">
                    <div className={cn(
                        "p-4 rounded-full bg-opacity-10 mb-2 ring-1 ring-inset ring-opacity-20",
                        config.iconStyle.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-'), // Create bg color from text color
                        config.iconStyle.replace('text-', 'ring-').replace('dark:text-', 'dark:ring-')
                    )}>
                        <Icon className={cn("w-10 h-10", config.iconStyle)} />
                    </div>
                    <div className="space-y-2">
                        <DialogTitle className="text-2xl font-serif tracking-tight">
                            {config.title}
                        </DialogTitle>
                        <DialogDescription className="text-center max-w-[85%] mx-auto leading-relaxed">
                            {config.description}
                        </DialogDescription>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

// --- Main Export ---
export default function UserBadge({ role, isNsfw }: { role: UserRole, isNsfw?: boolean }) {
    const badges = [];

    // Order matters: Roles first, then NSFW
    if (role && role !== 'user' && BADGE_CONFIG[role]) {
        badges.push({ type: role, config: BADGE_CONFIG[role] });
    }

    if (isNsfw && BADGE_CONFIG.nsfw) {
        badges.push({ type: 'nsfw', config: BADGE_CONFIG.nsfw });
    }

    if (badges.length === 0) return null;

    return (
        <div className="flex items-center gap-2 select-none">
            {badges.map((b) => (
                <BadgeItem key={b.type} type={b.type} config={b.config} />
            ))}
        </div>
    );
}