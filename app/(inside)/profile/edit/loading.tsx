import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function EditProfileLoading() {
    return (
        <div className="container max-w-3xl mx-auto py-10 px-4 space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-2 mb-8">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-96" />
            </div>

            {/* Avatar Card Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-3 w-full max-w-xs">
                        <Skeleton className="h-9 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-40" />
                    </div>
                </CardContent>
            </Card>

            {/* Form Fields Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}