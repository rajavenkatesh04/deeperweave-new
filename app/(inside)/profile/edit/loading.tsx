import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function EditProfileLoading() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-32 py-8 px-4">

            {/* Avatar Card — banner + floating avatar */}
            <Card className="overflow-hidden">
                <div className="h-24 bg-zinc-100 dark:bg-zinc-800" />
                <CardContent className="pt-0 pb-6 px-6">
                    <div className="flex items-end justify-between -mt-10 mb-5">
                        <Skeleton className="h-20 w-20 rounded-2xl border-4 border-background" />
                        <Skeleton className="h-8 w-28 mb-1" />
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-64" />
                    </div>
                </CardContent>
            </Card>

            {/* Profile Details Card */}
            <Card>
                <CardHeader className="pb-4">
                    <Skeleton className="h-6 w-36 mb-1.5" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-8" />
                            <Skeleton className="h-3 w-28" />
                        </div>
                        <Skeleton className="h-28 w-full" />
                    </div>
                </CardContent>
            </Card>

            {/* Showcase section */}
            <div className="space-y-3">
                <div className="flex items-baseline justify-between mb-3 px-1">
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-3 w-16" />
                </div>

                {/* Two skeleton section cards */}
                {[0, 1].map(i => (
                    <Card key={i} className="p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-8 flex-1" />
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                        </div>
                        <div className="flex gap-4">
                            {[0, 1, 2].map(j => (
                                <div key={j} className="flex flex-col items-center gap-1.5 w-24">
                                    <Skeleton className="w-full aspect-2/3 rounded-lg" />
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-5 w-14 rounded-md" />
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}

                {/* Add section button skeleton */}
                <Skeleton className="h-12 w-full rounded-xl" />
            </div>
        </div>
    );
}