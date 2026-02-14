import {TimelineSkeletonList} from "@/app/ui/skeleton";


export default function Loading() {
    return (
        // Standardized wrapper: Matches ProfileListsPage and ProfilePostsPage spacing
        <div className="w-full max-w-4xl mx-auto pt-8 px-4 md:px-3 pb-20 relative z-10">

            {/* --- Header Skeleton --- */}
            <div className="flex items-center justify-between mb-6">
                {/* Title Skeleton: e.g., "Timeline (12)" */}
                <div className="h-7 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />

                {/* Button Skeleton: "Add Entry" (Only visible to owners) */}
                <div className="h-8 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
            </div>

            {/* --- Timeline List Skeleton --- */}
            {/* Matches the design of TimelineEntryCard (Poster left, Content right) */}
            <TimelineSkeletonList />
        </div>
    );
}