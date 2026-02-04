import Link from 'next/link';
import { ArrowLeftIcon, ArrowRightIcon, DocumentTextIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { dmSerif, googleSansCode, geistSans } from '@/app/ui/shared/fonts';

export default function PoliciesPage() {
    return (
        <div className={`min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 ${geistSans.className}`}>

            {/* --- Header --- */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link
                        href="/"
                        className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                        <span className={googleSansCode.className}>DEEPERWEAVE</span>
                    </Link>
                </div>
            </header>

            {/* --- Main Content --- */}
            <main className="py-24 px-6">
                <div className="max-w-4xl mx-auto">

                    {/* Title */}
                    <div className="mb-20 text-center">
                        <h1 className={`${dmSerif.className} text-5xl md:text-7xl text-zinc-900 dark:text-zinc-100 mb-6 tracking-tight`}>
                            Legal Center
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 font-light max-w-lg mx-auto leading-relaxed">
                            Transparency is key. Here you'll find all the documents governing the use of the DeeperWeave platform.
                        </p>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid md:grid-cols-2 gap-6">

                        {/* Terms Card */}
                        <Link href="/policies/terms" className="group p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <DocumentTextIcon className="w-32 h-32 rotate-12" />
                            </div>

                            <div className="relative z-10 h-full flex flex-col">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors duration-500">
                                    <DocumentTextIcon className="w-6 h-6 text-zinc-500 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors duration-500" />
                                </div>

                                <h2 className={`${dmSerif.className} text-3xl mb-3 text-zinc-900 dark:text-zinc-100`}>Terms of Service</h2>
                                <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-light flex-1 leading-relaxed">
                                    The rules of the set. Read about content ownership, user conduct, and your agreement with us.
                                </p>

                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors duration-500">
                                    Read Terms <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>

                        {/* Privacy Card */}
                        <Link href="/policies/privacy" className="group p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ShieldCheckIcon className="w-32 h-32 rotate-12" />
                            </div>

                            <div className="relative z-10 h-full flex flex-col">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors duration-500">
                                    <ShieldCheckIcon className="w-6 h-6 text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors duration-500" />
                                </div>

                                <h2 className={`${dmSerif.className} text-3xl mb-3 text-zinc-900 dark:text-zinc-100`}>Privacy Policy</h2>
                                <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-light flex-1 leading-relaxed">
                                    Your data rights. How we process information, manage cookies, and protect your digital privacy.
                                </p>

                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors duration-500">
                                    Read Policy <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>

                    </div>

                    {/* Footer */}
                    <div className="mt-32 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center">
                        <p className="text-zinc-400 text-sm">
                            &copy; 2026 DeeperWeave. All rights reserved.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}