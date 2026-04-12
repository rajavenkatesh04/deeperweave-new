'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Trash2, MessageCircle } from 'lucide-react';
import { useComments } from '@/lib/hooks/use-comments';
import { CommentWithAuthor } from '@/lib/definitions';
import { Spinner } from '@/components/ui/spinner';
import { formatDistanceToNow } from 'date-fns';

interface CommentSectionProps {
    reviewId:          string;
    initialComments:   CommentWithAuthor[];
    currentUserId?:    string;
}

export function CommentSection({ reviewId, initialComments, currentUserId }: CommentSectionProps) {
    const { comments, isPending, addComment, deleteComment } = useComments(reviewId, initialComments);
    const [draft, setDraft] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!draft.trim()) return;
        await addComment(draft);
        setDraft('');
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                <MessageCircle className="w-4 h-4" />
                <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
            </div>

            {/* Comment list */}
            <div className="space-y-3">
                {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3 group">
                        {/* Avatar */}
                        <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium">
                            {comment.author.avatar_url ? (
                                <Image
                                    src={comment.author.avatar_url}
                                    alt={comment.author.username ?? ''}
                                    width={28}
                                    height={28}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <span>{comment.author.full_name?.[0] ?? '?'}</span>
                            )}
                        </div>

                        {/* Body */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                    @{comment.author.username}
                                </span>
                                <span className="text-xs text-zinc-400">
                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-0.5 break-words">
                                {comment.content}
                            </p>
                        </div>

                        {/* Delete (own comments only) */}
                        {currentUserId === comment.user_id && (
                            <button
                                onClick={() => deleteComment(comment.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500 shrink-0 self-start mt-0.5"
                                aria-label="Delete comment"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Composer */}
            {currentUserId && (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        placeholder="Write a comment…"
                        maxLength={500}
                        disabled={isPending}
                        className="flex-1 text-sm bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 outline-none placeholder:text-zinc-400 disabled:opacity-50 focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                    />
                    <button
                        type="submit"
                        disabled={isPending || !draft.trim()}
                        className="px-3 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold disabled:opacity-40 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
                    >
                        {isPending ? <Spinner className="w-3.5 h-3.5" /> : 'Post'}
                    </button>
                </form>
            )}
        </div>
    );
}
