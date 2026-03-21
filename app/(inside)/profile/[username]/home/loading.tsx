import { Skeleton } from "@/components/ui/skeleton";

function ShowcaseSectionSkeleton() {
    return (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5 space-y-4">
            <Skeleton className="h-3 w-24" />
            <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map(i => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="w-full aspect-2/3 rounded-xl" />
                        <Skeleton className="h-3.5 w-3/4" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ProfileHomeLoading() {
    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4 space-y-8 pb-24 animate-pulse">

            {/* Widgets placeholder */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-6 flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="space-y-2">
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-3 w-44" />
                </div>
            </div>

            {/* Showcase heading */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-28" />
                <ShowcaseSectionSkeleton />
                <ShowcaseSectionSkeleton />
            </div>
        </div>
    );
}