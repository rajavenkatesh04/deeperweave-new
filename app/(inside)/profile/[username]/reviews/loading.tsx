import { ReviewCardSkeleton } from '@/app/ui/reviews/review-card';

export default function Loading() {
    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="h-7 w-36 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
                <div className="h-8 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
            </div>

            {/* Year header skeleton */}
            <div className="flex items-center gap-4 mb-6">
                <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Month label skeleton */}
            <div className="h-3 w-12 bg-zinc-100 dark:bg-zinc-800/60 rounded mb-2 ml-1 animate-pulse" />

            {/* Cards */}
            <div className="space-y-1">
                <ReviewCardSkeleton />
                <ReviewCardSkeleton />
                <ReviewCardSkeleton />
            </div>

            {/* Second month */}
            <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800/60 rounded mb-2 ml-1 mt-5 animate-pulse" />
            <div className="space-y-1">
                <ReviewCardSkeleton />
                <ReviewCardSkeleton />
            </div>
        </div>
    );
}
