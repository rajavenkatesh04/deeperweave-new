import Image from 'next/image';
import Link from 'next/link';
import { SignupForm } from '@/components/signup-form';
import { PlayWriteNewZealandFont } from '@/app/ui/shared/fonts';

export default function SignupPage() {
    return (
        <div className="min-h-svh flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative p-6 md:p-10">
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
                <Link href="/" className="flex items-center gap-2.5 self-center">
                    <Image src="/icon1.png" alt="DeeperWeave Logo" height={36} width={36} className="rounded-md" />
                    <span className={`text-xl font-bold tracking-tight ${PlayWriteNewZealandFont.className}`}>
                        DeeperWeave
                    </span>
                </Link>

                <SignupForm />
            </div>
        </div>
    );
}