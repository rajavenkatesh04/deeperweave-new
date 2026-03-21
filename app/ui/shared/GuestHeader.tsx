import Link from 'next/link';
import { PlayWriteNewZealandFont } from '@/app/ui/shared/fonts';

export default function GuestHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                <Link href="/" className={`${PlayWriteNewZealandFont.className} text-lg font-bold text-zinc-900 dark:text-zinc-100`}>
                    DeeperWeave
                </Link>
                <div className="flex items-center gap-2">
                    <Link
                        href="/auth/login"
                        className="px-4 py-1.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/auth/sign-up"
                        className="px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </header>
    );
}
