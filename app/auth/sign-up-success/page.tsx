import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { PlayWriteNewZealandFont } from '@/app/ui/shared/fonts';

export const metadata: Metadata = {
    title: 'Check Your Inbox — DeeperWeave',
    description: 'Verify your email to continue.',
};

export default async function SignupSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ userEmail?: string }>;
}) {
    const params = await searchParams;
    const userEmail = params?.userEmail ?? 'your registered email';

    return (
        <div className="min-h-svh flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative p-6">
            {/* Polka dot — light */}
            <div
                className="dark:hidden absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #d4d4d8 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />
            {/* Polka dot — dark */}
            <div
                className="hidden dark:block absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="relative z-10 flex w-full max-w-sm flex-col gap-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 self-center">
                    <Image src="/icon1.png" alt="DeeperWeave Logo" height={36} width={36} className="rounded-md" />
                    <span className={`text-xl font-bold tracking-tight ${PlayWriteNewZealandFont.className}`}>
                        DeeperWeave
                    </span>
                </Link>

                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                                <Mail className="w-7 h-7 text-zinc-700 dark:text-zinc-300" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1.5">
                                <CardTitle className="text-base font-semibold">Check your inbox</CardTitle>
                                <CardDescription className="text-sm">
                                    We&apos;ve sent a verification link to
                                </CardDescription>
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 break-all">
                                    {userEmail}
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 divide-y divide-zinc-200 dark:divide-zinc-700 text-sm">
                            {[
                                'Click the link in the email to verify',
                                'Check spam or junk if you don\'t see it',
                                'It usually arrives in under a minute',
                            ].map((tip) => (
                                <div key={tip} className="px-4 py-2.5 text-zinc-500 flex items-center gap-2.5">
                                    <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500 shrink-0" />
                                    {tip}
                                </div>
                            ))}
                        </div>

                        <p className="text-center text-sm text-zinc-500">
                            Wrong email?{' '}
                            <Link
                                href="/auth/sign-up"
                                className="font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-4 hover:opacity-75 transition-opacity"
                            >
                                Try again
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}