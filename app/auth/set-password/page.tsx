import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PlayWriteNewZealandFont } from '@/app/ui/shared/fonts';
import { SetPasswordForm } from './SetPasswordForm';

export const metadata: Metadata = { title: 'Set New Password — DeeperWeave' };

export default async function SetPasswordPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    return (
        <div className="min-h-svh flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative p-6">
            {/* Polka dot pattern — light */}
            <div
                className="dark:hidden absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #d4d4d8 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />
            {/* Polka dot pattern — dark */}
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

                <SetPasswordForm />
            </div>
        </div>
    );
}