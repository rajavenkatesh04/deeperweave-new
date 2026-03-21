import { Skeleton } from "@/components/ui/skeleton";

function StatCard() {
    return (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
        </div>
    );
}

export default function AnalyticsLoading() {
    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4 space-y-8 pb-24 animate-pulse">

            {/* Top stat cards row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map(i => <StatCard key={i} />)}
            </div>

            {/* Activity heatmap / chart area */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
                <Skeleton className="h-4 w-40" />
                <div className="flex gap-1">
                    {Array.from({ length: 52 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-1">
                            {[0, 1, 2, 3, 4, 5, 6].map(j => (
                                <Skeleton key={j} className="h-3 w-3 rounded-sm" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Two column section — bar chart + pie chart */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                    <Skeleton className="h-4 w-36" />
                    {[80, 55, 65, 45, 30].map((w, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-3 w-10 shrink-0" />
                            <Skeleton className={`h-5 rounded`} style={{ width: `${w}%` }} />
                        </div>
                    ))}
                </div>
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
                    <Skeleton className="h-4 w-36" />
                    <div className="flex items-center justify-center py-4">
                        <Skeleton className="h-36 w-36 rounded-full" />
                    </div>
                    <div className="space-y-2">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="flex items-center gap-2">
                                <Skeleton className="h-3 w-3 rounded-full" />
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-3 w-8 ml-auto" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Monthly timeline */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-36" />
                    <div className="flex gap-2">
                        <Skeleton className="h-7 w-7 rounded-lg" />
                        <Skeleton className="h-7 w-7 rounded-lg" />
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 31 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full rounded-lg" />
                    ))}
                </div>
            </div>

            {/* Top movies row */}
            <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-3 overflow-hidden">
                    {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} className="shrink-0 space-y-2">
                            <Skeleton className="w-24 aspect-2/3 rounded-xl" />
                            <Skeleton className="h-3 w-20 mx-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}