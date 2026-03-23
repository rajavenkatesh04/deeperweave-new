import { Bell } from 'lucide-react';

export default function NotificationsPage() {
    return (
        <div className="w-full max-w-2xl mx-auto py-16 px-4 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Bell className="w-8 h-8 text-zinc-400" />
            </div>
            <div className="space-y-2">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Notifications</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
                    You&apos;ll be notified here when someone follows you, likes your reviews, or mentions you. Coming soon.
                </p>
            </div>
        </div>
    );
}