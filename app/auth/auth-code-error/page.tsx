import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayWriteNewZealandFont } from '@/app/ui/shared/fonts';

export const metadata: Metadata = { title: 'Auth Error — DeeperWeave' };

export default function AuthCodeErrorPage() {
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
                <Link href="/auth/login" className="flex items-center gap-2.5 self-center">
                    <Image src="/icon1.png" alt="DeeperWeave Logo" height={36} width={36} className="rounded-md" />
                    <span className={`text-xl font-bold tracking-tight ${PlayWriteNewZealandFont.className}`}>
                        DeeperWeave
                    </span>
                </Link>

                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20">
                                <AlertTriangle className="w-5 h-5 text-red-500" strokeWidth={1.5} />
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold">Link expired or invalid</CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    This link can only be used once.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 divide-y divide-zinc-200 dark:divide-zinc-700 text-sm">
                            {[
                                'The link may have already been used',
                                'Auth links expire after a short time',
                                'Try signing in again to get a new one',
                            ].map((tip) => (
                                <div key={tip} className="px-4 py-2.5 text-zinc-500 flex items-center gap-2.5">
                                    <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500 shrink-0" />
                                    {tip}
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button asChild className="w-full">
                                <Link href="/auth/login">Back to login</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/auth/forgot-password">Request a new link</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}