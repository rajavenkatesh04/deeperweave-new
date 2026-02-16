import { Skeleton } from "@/components/ui/skeleton";
import { LayoutDashboard, Film, Tv } from 'lucide-react';

export default function Loading() {
    return (
        <div className="container max-w-6xl mx-auto py-8 px-4">
            {/* Header Skeleton */}
            <div className="mb-8 space-y-2">
                <Skeleton className="h-8 w-48 rounded-md" />
                <Skeleton className="h-4 w-72 rounded-md" />
            </div>

            {/* Tabs Skeleton - Mimics the real tabs layout */}
            <div className="w-full mb-8">
                <div className="flex items-center gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    {/* We mimic the tab triggers roughly */}
                    <div className="flex items-center gap-2 px-2 pb-2 border-b-2 border-transparent">
                        <LayoutDashboard className="w-4 h-4 text-zinc-200 dark:text-zinc-800" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="flex items-center gap-2 px-2 pb-2 border-b-2 border-transparent">
                        <Film className="w-4 h-4 text-zinc-200 dark:text-zinc-800" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-2 pb-2 border-b-2 border-transparent">
                        <Tv className="w-4 h-4 text-zinc-200 dark:text-zinc-800" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                </div>
            </div>

            {/* Grid Skeleton - Matches SavedGrid responsive columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2.5">
                        {/* Poster Aspect Ratio */}
                        <Skeleton className="aspect-2/3 w-full rounded-xl" />

                        {/* Meta Text */}
                        <div className="space-y-1.5 px-0.5">
                            <Skeleton className="h-4 w-3/4 rounded-sm" />
                            <Skeleton className="h-3 w-1/4 rounded-sm" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}