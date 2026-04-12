'use client';

import { useState } from 'react';
import { useNotifications } from '@/lib/hooks/use-notifications';
import { NotificationItem } from '@/app/ui/social/NotificationItem';
import { NotificationRecord } from '@/lib/definitions';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';

interface NotificationsClientProps {
    userId:               string;
    initialNotifications: NotificationRecord[];
}

export function NotificationsClient({ userId, initialNotifications }: NotificationsClientProps) {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllRead,
        clearNotification,
        clearAll,
    } = useNotifications(userId, initialNotifications);

    const [confirmClear, setConfirmClear] = useState(false);

    const handleClearAll = async () => {
        if (!confirmClear) {
            setConfirmClear(true);
            // Auto-reset confirmation state after 3 s if user doesn't click again
            setTimeout(() => setConfirmClear(false), 3000);
            return;
        }
        setConfirmClear(false);
        await clearAll();
    };

    return (
        <div className="w-full max-w-2xl mx-auto py-6 px-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-2 mb-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="text-xs font-semibold bg-blue-500 text-white rounded-full px-2 py-0.5 leading-none">
                            {unreadCount}
                        </span>
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                Mark all read
                            </button>
                        )}
                        <button
                            onClick={handleClearAll}
                            className={`flex items-center gap-1.5 text-xs transition-colors ${
                                confirmClear
                                    ? 'text-red-600 font-semibold'
                                    : 'text-zinc-400 hover:text-red-500'
                            }`}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            {confirmClear ? 'Tap again to confirm' : 'Clear all'}
                        </button>
                    </div>
                )}
            </div>

            {/* Empty state */}
            {notifications.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Bell className="w-7 h-7 text-zinc-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No notifications yet</p>
                        <p className="text-xs text-zinc-400 mt-1">
                            You&apos;ll be notified when someone follows, likes, or comments.
                        </p>
                    </div>
                </div>
            )}

            {/* Notification list */}
            <div className="space-y-0.5">
                {notifications.map(notif => (
                    <NotificationItem
                        key={notif.id}
                        notification={notif}
                        onMarkRead={markAsRead}
                        onClear={clearNotification}
                    />
                ))}
            </div>
        </div>
    );
}
