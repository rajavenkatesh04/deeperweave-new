'use client';

import { useActionState } from 'react';
import { sendSupportTicket } from '@/lib/actions/support-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"; // Assuming shadcn select
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

const initialState = {
    message: null,
    errors: {},
    success: false
};

export default function SupportPage() {
    const [state, formAction, isPending] = useActionState(sendSupportTicket, initialState);

    return (
        <div className={`min-h-screen w-full bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-4 md:p-8`}>

            <div className="w-full max-w-lg space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Contact Support</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Found a bug? Have a feature request? Let us know.
                    </p>
                </div>

                {/* Success State */}
                {state.success ? (
                    <div className="rounded-2xl border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900 p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-green-900 dark:text-green-100">Message Received</h3>
                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                Thanks for reaching out! Our team will get back to you at your provided email shortly.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                            className="mt-4 border-green-200 hover:bg-green-100 dark:border-green-800 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300"
                        >
                            Send another message
                        </Button>
                    </div>
                ) : (
                    /* Form */
                    <form action={formAction} className="space-y-6 bg-zinc-50 dark:bg-zinc-900/50 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800">

                        {/* General Error Message */}
                        {state.message && !state.success && (
                            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4" />
                                <p>{state.message}</p>
                            </div>
                        )}

                        <div className="space-y-4">

                            {/* Name & Email Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Your name"
                                        className="bg-white dark:bg-zinc-950"
                                    />
                                    <ErrorMessage errors={state.errors?.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="bg-white dark:bg-zinc-950"
                                    />
                                    <ErrorMessage errors={state.errors?.email} />
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="space-y-2">
                                <Label htmlFor="subject">Topic</Label>
                                <Select name="subject" defaultValue="general">
                                    <SelectTrigger className="bg-white dark:bg-zinc-950">
                                        <SelectValue placeholder="Select a topic" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General Inquiry</SelectItem>
                                        <SelectItem value="bug">Report a Bug</SelectItem>
                                        <SelectItem value="feature">Feature Request</SelectItem>
                                        <SelectItem value="billing">Billing Issue</SelectItem>
                                    </SelectContent>
                                </Select>
                                <ErrorMessage errors={state.errors?.subject} />
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    placeholder="Tell us more about what you need..."
                                    className="min-h-[120px] bg-white dark:bg-zinc-950 resize-none"
                                />
                                <ErrorMessage errors={state.errors?.message} />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-11 text-base"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                "Send Message"
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}

// Simple helper for field errors
function ErrorMessage({ errors }: { errors?: string[] }) {
    if (!errors?.length) return null;
    return (
        <p className="text-xs text-red-500 font-medium animate-in slide-in-from-top-1">
            {errors[0]}
        </p>
    );
}