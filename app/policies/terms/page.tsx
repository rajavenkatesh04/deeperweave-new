import Link from 'next/link';
import { ArrowLeftIcon, ArrowUpRightIcon } from '@heroicons/react/24/solid';
import { BelanosimaFont, geistSans, googleSansCode } from '@/app/ui/shared/fonts';
import Image from "next/image";

// --- SideBar Items ---
const SECTIONS = [
    { id: 'covenant', label: '01. The Covenant' },
    { id: 'membership', label: '02. Membership' },
    { id: 'content', label: '03. User Content' },
    { id: 'ip', label: '04. Intellectual Property' },
    { id: 'termination', label: '05. Termination' },
    { id: 'liability', label: '06. Liability' },
    { id: 'contact', label: '07. Contact' },
];

export default function TermsOfServicePage() {
    return (
        <div className={`min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 ${geistSans.className}`}>

            {/* --- Top Highlight Gradient --- */}
            <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-zinc-200/50 to-transparent dark:from-zinc-900/50 dark:to-transparent pointer-events-none z-0" />

            {/* --- Header --- */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link
                        href="/"
                        className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                        <span className={googleSansCode.className}>DEEPERWEAVE</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <span className={`hidden sm:block text-[10px] font-bold uppercase tracking-widest text-zinc-400 ${googleSansCode.className}`}>
                            Last Updated: January 16, 2026
                        </span>
                        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 hidden sm:block" />
                        <Link href="/auth/login" className="text-sm font-semibold hover:text-amber-600 transition-colors">
                            Log In
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* --- Sidebar (Table of Contents) --- */}
                    <aside className="lg:col-span-3 lg:block hidden">
                        <div className="sticky top-28 space-y-8">
                            <div>
                                <h1 className={`${BelanosimaFont.className} text-4xl text-zinc-900 dark:text-zinc-100 mb-2`}>
                                    Terms of <br/> Service
                                </h1>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                    The rules of the set. Please read carefully before rolling camera.
                                </p>
                            </div>

                            <nav className="space-y-1">
                                {SECTIONS.map((section) => (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        className={`block py-2 px-3 -mx-3 rounded-md text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all ${googleSansCode.className}`}
                                    >
                                        {section.label}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* --- Mobile Title (Visible only on small screens) --- */}
                    <div className="lg:hidden col-span-1">
                        <h1 className={`${BelanosimaFont.className} text-4xl text-zinc-900 dark:text-zinc-100 mb-2`}>
                            Terms of Service
                        </h1>
                    </div>

                    {/* --- Main Content --- */}
                    <div className="lg:col-span-8 lg:col-start-5 space-y-20">

                        {/* Section 1 */}
                        <section id="covenant" className="scroll-mt-32">
                            <SectionHeader number="01" title="The Cinematic Covenant" />
                            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
                                Welcome to DeeperWeave. By accessing our platform, creating timelines, or weaving your cinematic lists, you agree to these Terms. DeeperWeave is a space for film lovers to catalog and discover art. Treat it—and your fellow cinephiles—with respect. If you disagree with any part of these terms, you may not access the Service.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section id="membership" className="scroll-mt-32">
                            <SectionHeader number="02" title="Membership & Accounts" />
                            <div className="space-y-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
                                <p>
                                    To curate your own deeper weave of content, you must register via Google Sign-In. You are the director of your account; you are responsible for safeguarding your access keys and for all activity that occurs under your profile.
                                </p>
                                <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 text-base">
                                    <strong>Note:</strong> We reserve the right to reclaim usernames if they infringe on trademarks or are held by inactive accounts for extended periods.
                                </div>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section id="content" className="scroll-mt-32">
                            <SectionHeader number="03" title="User Generated Content" />
                            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-300 mb-4">
                                DeeperWeave allows you to post reviews, create lists, and build timelines. By posting, you grant us a license to display and distribute this content on the platform.
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <RuleCard title="No Hate Speech" desc="Harassment, bullying, or hate speech towards any user or group is strictly prohibited." />
                                <RuleCard title="No Spoilers (Unmarked)" desc="Please use the spoiler tag feature when revealing key plot points." />
                                <RuleCard title="No Illegal Content" desc="Do not post pirated content or links to illegal streaming services." />
                                <RuleCard title="Authenticity" desc="Do not impersonate others or use automated bots to artificially inflate likes." />
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section id="ip" className="scroll-mt-32">
                            <SectionHeader number="04" title="Intellectual Property" />
                            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
                                The DeeperWeave interface, logo, and code are our proprietary property. You may not copy, modify, or distribute our code without permission.
                            </p>
                            <div className="mt-6 flex items-start gap-4">
                                <div className="p-3 shadow-sm shrink-0">
                                    <Image src={`/tmdb.svg`} alt={`TMDB Logo`} width={50} height={50} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Powered by TMDB</h4>
                                    <p className="text-sm text-zinc-500 mt-1">
                                        Metadata, posters, and backdrops for movies and TV shows are provided by <a href="https://www.themoviedb.org/" target="_blank" className="underline hover:text-amber-600">The Movie Database (TMDb)</a>. This product uses the TMDb API but is not endorsed or certified by TMDb.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section 5 */}
                        <section id="termination" className="scroll-mt-32">
                            <SectionHeader number="05" title="Termination" />
                            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
                                We may suspend or terminate your access to DeeperWeave immediately, without prior notice, if you breach these Terms. Upon termination, your right to use the Service will cease immediately. You may also delete your account at any time via the Settings page.
                            </p>
                        </section>

                        {/* Section 6 */}
                        <section id="liability" className="scroll-mt-32">
                            <SectionHeader number="06" title="Limitation of Liability" />
                            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
                                DeeperWeave is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot;. We weave the code, but we cannot guarantee it will never unravel. We are not liable for any indirect damages, loss of data (lists, watch history), or service interruptions.
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section id="contact" className="scroll-mt-32">
                            <SectionHeader number="07" title="Contact The Studio" />
                            <div className="bg-zinc-900 text-zinc-100 p-8 rounded-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/20 transition-colors" />

                                <h3 className="text-xl font-bold mb-2">Have questions?</h3>
                                <p className="text-zinc-400 mb-6">For legal inquiries or support regarding these terms.</p>

                                <a href="mailto:grv.9604@gmail.com" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-200 transition-colors">
                                    Email Support
                                    <ArrowUpRightIcon className="w-4 h-4" />
                                </a>
                            </div>
                        </section>

                    </div>
                </div>

                <footer className="mt-32 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-400">
                    &copy; 2026 DeeperWeave. All rights reserved.
                </footer>
            </main>
        </div>
    );
}

// --- Helper Components ---

function SectionHeader({ number, title }: { number: string; title: string }) {
    return (
        <div className="flex items-baseline gap-4 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <span className={`text-sm font-bold text-amber-600 dark:text-amber-500 ${googleSansCode.className}`}>
                {number}
            </span>
            <h2 className={`text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100 ${BelanosimaFont.className}`}>
                {title}
            </h2>
        </div>
    );
}

function RuleCard({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-colors">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{title}</h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{desc}</p>
        </div>
    );
}