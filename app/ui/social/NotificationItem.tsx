'use client';

import Image from 'next/image';
import { useState } from 'react';
import { X } from 'lucide-react';
import { useFollow } from '@/lib/hooks/use-follow';
import { NotificationRecord } from '@/lib/definitions';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// ── Follow request action buttons (own state machine) ──────────────────────

type RequestState = 'pending' | 'accepted' | 'declined';

function FollowRequestActions({
    actorId,
    notifId,
    onMarkRead,
}: {
    actorId:    string;
    notifId:    string;
    onMarkRead: (id: string) => void;
}) {
    const [reqState, setReqState] = useState<RequestState>('pending');
    const { isPending, acceptRequest, rejectRequest } = useFollow(actorId, 'none');

    if (reqState === 'accepted') {
        return <p className="text-xs text-zinc-400 mt-1.5">Accepted</p>;
    }
    if (reqState === 'declined') {
        return <p className="text-xs text-zinc-400 mt-1.5">Declined</p>;
    }

    return (
        <div className="flex gap-2 mt-2">
            <button
                onClick={() => {
                    setReqState('accepted'); // optimistic
                    acceptRequest(actorId);
                    onMarkRead(notifId);
                }}
                disabled={isPending}
                className="px-3 py-1 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
                Accept
            </button>
            <button
                onClick={() => {
                    setReqState('declined'); // optimistic
                    rejectRequest(actorId);
                    onMarkRead(notifId);
                }}
                disabled={isPending}
                className="px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
                Decline
            </button>
        </div>
    );
}

// ── Main component ──────────────────────────────────────────────────────────

interface NotificationItemProps {
    notification: NotificationRecord;
    onMarkRead:   (id: string) => void;
    onClear:      (id: string) => void;
}

export function NotificationItem({ notification, onMarkRead, onClear }: NotificationItemProps) {
    const { type, metadata, actor_id, is_read, created_at } = notification;

    const name = metadata?.actor_full_name ?? metadata?.actor_username ?? 'Someone';

    const message: Record<string, string> = {
        new_follower:    `${name} started following you`,
        follow_request:  `${name} wants to follow you`,
        follow_accepted: `${name} accepted your follow request`,
        like:            `${name} liked your review`,
        comment:         `${name} commented: "${metadata?.comment_preview ?? ''}"`,
        mention:         `${name} mentioned you`,
    };

    return (
        <div
            className={cn(
                'group flex gap-3 px-4 py-3 rounded-xl transition-colors',
                !is_read
                    ? 'bg-zinc-50 dark:bg-zinc-900/60'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/30'
            )}
            onClick={() => !is_read && onMarkRead(notification.id)}
        >
            {/* Unread dot */}
            <div className="flex items-start pt-2 shrink-0 w-2">
                <div className={cn('w-2 h-2 rounded-full', !is_read ? 'bg-blue-500' : 'bg-transparent')} />
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-medium">
                {metadata?.actor_avatar_url ? (
                    <Image
                        src={metadata.actor_avatar_url}
                        alt={name}
                        width={36}
                        height={36}
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <span>{name[0]}</span>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-snug">
                    {message[type] ?? 'New notification'}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                    {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
                </p>

                {type === 'follow_request' && (
                    <FollowRequestActions
                        actorId={actor_id}
                        notifId={notification.id}
                        onMarkRead={onMarkRead}
                    />
                )}
            </div>

            {/* Dismiss button — visible on hover */}
            <button
                onClick={(e) => { e.stopPropagation(); onClear(notification.id); }}
                aria-label="Dismiss notification"
                className="opacity-0 group-hover:opacity-100 transition-opacity self-start mt-1 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
