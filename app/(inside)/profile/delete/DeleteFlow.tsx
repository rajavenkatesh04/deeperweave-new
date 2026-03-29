'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteAccount } from '@/lib/actions/settings-actions';
import { Spinner } from '@/components/ui/spinner';
import {
    ArrowLeft,
    User,
    FileText,
    BookMarked,
    Users,
    ImageIcon,
    CreditCard,
    AlertTriangle,
} from 'lucide-react';

interface DeleteFlowProps {
    username: string;
    displayName: string;
    reviewCount: number;
}

const REASONS = [
    { value: 'better_alternative', label: "Found a better alternative" },
    { value: 'not_using', label: "Not using it enough" },
    { value: 'privacy', label: "Privacy concerns" },
    { value: 'missing_features', label: "Missing features" },
    { value: 'too_expensive', label: "Too expensive" },
    { value: 'other', label: "Other reason" },
] as const;

const CONFIRMATION_WORD = 'DELETE';

export function DeleteFlow({ username, displayName, reviewCount }: DeleteFlowProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [comment, setComment] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [error, setError] = useState<string | null>(null);

    const isConfirmed = confirmation === CONFIRMATION_WORD;

    const handleSubmit = () => {
        if (!isConfirmed) return;
        setError(null);
        startTransition(async () => {
            const result = await deleteAccount(selectedReason, comment);
            if (result?.error) {
                setError(result.error);
            } else {
                const firstName = displayName.split(' ')[0];
                router.replace(`/goodbye?name=${encodeURIComponent(firstName)}`);
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">

            <Link
                href="/profile/settings"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Settings
            </Link>

            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">
                    Delete Account
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    We&#39;re sorry to see you go, {displayName}. Please note that deleting your account is permanent and cannot be undone.
                </p>
            </div>

            {/* What gets deleted */}
            <div className="mb-10">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    What will be permanently removed:
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <DeletionItem icon={User} text="Your profile and username" />
                    <DeletionItem
                        icon={FileText}
                        text={
                            reviewCount > 0
                                ? `All ${reviewCount.toLocaleString()} reviews you've written`
                                : 'All reviews you have written'
                        }
                    />
                    <DeletionItem icon={BookMarked} text="Saved lists and bookmarks" />
                    <DeletionItem icon={Users} text="Followers and following data" />
                    <DeletionItem icon={ImageIcon} text="Avatars and uploaded media" />
                    <DeletionItem icon={CreditCard} text="Active subscriptions" />
                </div>
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800 my-10" />

            {/* Feedback — optional */}
            <div className="mb-10">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    Help us improve (Optional)
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
                    Why are you deciding to leave?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {REASONS.map((r) => (
                        <label
                            key={r.value}
                            className={`group relative flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                                selectedReason === r.value
                                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/50 ring-1 ring-zinc-900 dark:ring-zinc-100'
                                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50'
                            }`}
                        >
                            <input
                                type="radio"
                                name="reason"
                                value={r.value}
                                checked={selectedReason === r.value}
                                onChange={() => setSelectedReason(r.value)}
                                className="sr-only"
                            />
                            <div
                                className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                                    selectedReason === r.value
                                        ? 'border-zinc-900 dark:border-zinc-100'
                                        : 'border-zinc-300 dark:border-zinc-600 group-hover:border-zinc-400'
                                }`}
                            >
                                {selectedReason === r.value && (
                                    <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                                )}
                            </div>
                            <span className={`text-sm ${selectedReason === r.value ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                {r.label}
                            </span>
                        </label>
                    ))}
                </div>

                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Any extra feedback you'd like to share?"
                    rows={3}
                    maxLength={500}
                    className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent resize-none transition-all"
                />
            </div>

            {/* Danger Zone / Confirmation */}
            <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0" />
                    <h2 className="text-base font-semibold text-red-900 dark:text-red-400">
                        Confirm Deletion
                    </h2>
                </div>
                <p className="text-sm text-red-800/80 dark:text-red-400/80 mb-6">
                    Please type <strong className="font-mono bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded select-all">{CONFIRMATION_WORD}</strong> below to confirm. This action cannot be reversed.
                </p>

                <input
                    type="text"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value.toUpperCase())}
                    placeholder={CONFIRMATION_WORD}
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full px-4 py-3 mb-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-zinc-950 text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />

                {error && (
                    <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-4">{error}</p>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={!isConfirmed || isPending}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-100 dark:disabled:bg-red-950/50 disabled:text-red-400 dark:disabled:text-red-800 text-white text-sm font-semibold transition-all disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                        {isPending && <Spinner className="w-4 h-4 text-current" />}
                        {isPending ? 'Deleting account...' : 'Yes, delete my account'}
                    </button>

                    <Link
                        href="/profile/"
                        className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                        Cancel
                    </Link>
                </div>
            </div>
        </div>
    );
}

function DeletionItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-red-600 dark:text-red-500" />
            </div>
            <span className="text-sm text-zinc-700 dark:text-zinc-300">{text}</span>
        </div>
    );
}