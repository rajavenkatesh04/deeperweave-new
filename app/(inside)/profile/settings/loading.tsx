import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SettingsLoading() {
    return (
        <div className="container max-w-2xl mx-auto py-10 px-4 space-y-8">
            <div>
                <Skeleton className="h-10 w-48 mb-2" />
                <Skeleton className="h-5 w-96" />
            </div>

            <div className="space-y-6">
                {/* Preference Card Skeleton */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-between">
                            <div className="space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-48" /></div>
                            <Skeleton className="h-6 w-10 rounded-full" />
                        </div>
                        <div className="h-[1px] bg-muted" />
                        <div className="flex justify-between">
                            <div className="space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-48" /></div>
                            <Skeleton className="h-6 w-10 rounded-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}