'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import FollowButton from '@/app/ui/profile/FollowButton';
import { RelationshipStatus } from '@/lib/definitions';
import { Spinner } from '@/components/ui/spinner';
import { Users } from 'lucide-react';

// Matches exactly what get_following_with_status returns
interface FollowingRow {
    user_id:      string;   // p.id aliased as user_id by the RPC
    username:     string;
    full_name:    string | null;
    avatar_url:   string | null;
    is_following: boolean;
    is_pending:   boolean;
    follows_you:  boolean;
}

interface FollowingListProps {
    targetUserId: string;
    viewerId?:    string;
}

const PAGE_SIZE = 20;

export function FollowingList({ targetUserId, viewerId }: FollowingListProps) {
    const [rows, setRows]           = useState<FollowingRow[]>([]);
    const [offset, setOffset]       = useState(0);
    const [hasMore, setHasMore]     = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = useMemo(() => createClient(), []);

    const fetchPage = useCallback(async (pageOffset: number) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_following_with_status', {
                target_user_id: targetUserId,
                viewer_id:      viewerId ?? '00000000-0000-0000-0000-000000000000',
                page_limit:     PAGE_SIZE,
                page_offset:    pageOffset,
            });

            if (error) {
                console.error('get_following_with_status error:', error);
                return;
            }

            const fetched = (data ?? []) as FollowingRow[];
            setRows(prev => pageOffset === 0 ? fetched : [...prev, ...fetched]);
            setHasMore(fetched.length === PAGE_SIZE);
            setOffset(pageOffset + PAGE_SIZE);
        } finally {
            setIsLoading(false);
        }
    }, [targetUserId, viewerId, supabase]);

    useEffect(() => { fetchPage(0); }, [fetchPage]);

    if (isLoading && rows.length === 0) {
        return (
            <div className="flex justify-center py-16">
                <Spinner className="text-zinc-400" />
            </div>
        );
    }

    if (!isLoading && rows.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 py-16 text-zinc-400">
                <Users className="w-8 h-8" />
                <p className="text-sm">Not following anyone yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {rows.map(row => {
                const status: RelationshipStatus = row.is_following
                    ? 'accepted'
                    : row.is_pending
                        ? 'pending'
                        : 'none';

                return (
                    <div
                        key={row.user_id}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                        <Link href={`/profile/${row.username}/home`} className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-medium">
                                {row.avatar_url ? (
                                    <Image
                                        src={row.avatar_url}
                                        alt={row.username}
                                        width={40}
                                        height={40}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <span>{row.full_name?.[0] ?? row.username[0]}</span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                    {row.full_name ?? row.username}
                                </p>
                                <p className="text-xs text-zinc-400 truncate">
                                    @{row.username}{row.follows_you && ' · Follows you'}
                                </p>
                            </div>
                        </Link>

                        {viewerId && viewerId !== row.user_id && (
                            <FollowButton targetUserId={row.user_id} initialStatus={status} />
                        )}
                    </div>
                );
            })}

            {hasMore && (
                <div className="flex justify-center pt-4 pb-2">
                    <button
                        onClick={() => fetchPage(offset)}
                        disabled={isLoading}
                        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? <Spinner className="w-4 h-4" /> : 'Load more'}
                    </button>
                </div>
            )}
        </div>
    );
}
