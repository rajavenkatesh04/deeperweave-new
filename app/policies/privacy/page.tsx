import Link from 'next/link';
import { ArrowLeftIcon, ArrowUpRightIcon } from '@heroicons/react/24/solid';
import { BelanosimaFont, geistSans, googleSansCode } from '@/app/ui/shared/fonts';

// --- SideBar Items ---
const SECTIONS = [
    { id: 'intro', label: '01. Introduction' },
    { id: 'collection', label: '02. Data Collection' },
    { id: 'usage', label: '03. Data Usage' },
    { id: 'cookies', label: '04. Cookies' },
    { id: 'sharing', label: '05. Sharing' },
    { id: 'security', label: '06. Security' },
    { id: 'contact', label: '07. Contact' },
];

export default function PrivacyPolicyPage() {
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
                                    Privacy <br/> Policy
                                </h1>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                    How we protect your data while you discover new worlds.
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

                    {/* --- Mobile Title --- */}
                    <div className="lg:hidden col-span-1">
                        <h1 className={`${BelanosimaFont.className} text-4xl text-zinc-900 dark:text-zinc-100 mb-2`}>
                            Privacy Policy
                        </h1>
                    </div>

                    {/* --- Main Content --- */}
                    <div className="lg:col-span-8 lg:col-start-5 space-y-20">

                        {/* Section 1 */}
                        <section id="intro" className="scroll-mt-32">
                            <SectionHeader number="01" title="Introduction" />
                            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
                                Welcome to DeeperWeave (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). Your privacy is as important as the plot of a good thriller. We are committed to transparency in how we collect, use, and share your personal data while you discover and track your favorite films and shows.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section id="collection" className="scroll-mt-32">
                            <SectionHeader number="02" title="Data We Collect" />
                            <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-6">
                                We collect information to provide a personalized cinematic experience. This allows us to recommend films, save your lists, and connect you with friends.
                            </p>

                            <div className="space-y-6">
                                <DataPoint
                                    icon="Identity"
                                    title="Personal Data"
                                    desc="We collect your name, email address, and profile picture when you authenticate via Google Sign-In."
                                />
                                <DataPoint
                                    icon="Movie"
                                    title="Cinematic Data"
                                    desc="The movies/shows you save, your ratings, custom lists, and timelines. This forms the core of your profile."
                                />
                                <DataPoint
                                    icon="Graph"
                                    title="Usage Analytics"
                                    desc="Anonymous data on how you navigate (e.g., most browsed genres) to help us improve performance."
                                />
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section id="usage" className="scroll-mt-32">
                            <SectionHeader number="03" title="How We Use Your Data" />
                            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-300 mb-4">
                                We do not sell your personal information. We use your data strictly to:
                            </p>
                            <ul className="list-disc pl-5 space-y-3 text-lg text-zinc-600 dark:text-zinc-300 marker:text-amber-500">
                                <li>Create and maintain your user account and profile.</li>
                                <li>Deliver live announcements and updates to event subscribers.</li>
                                <li>Display your reviews and lists to other users (subject to your privacy settings).</li>
                                <li>Monitor usage trends to optimize the application experience.</li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section id="cookies" className="scroll-mt-32">
                            <SectionHeader number="04" title="Cookies & Tracking" />
                            <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-lg border-l-4 border-amber-500">
                                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">Essential Cookies Only</h4>
                                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                    We primarily use cookies for authentication (keeping you logged in) and essential site preferences (like Dark Mode). We also use third-party analytics cookies (Vercel Analytics, Microsoft Clarity) to understand site traffic, but only with your consent.
                                </p>
                            </div>
                        </section>

                        {/* Section 5 */}
                        <section id="sharing" className="scroll-mt-32">
                            <SectionHeader number="05" title="Third-Party Sharing" />
                            <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-6">
                                We rely on trusted third-party providers to power DeeperWeave. Your data passes through their secure systems:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <ServiceCard name="SupaBase" role="Auth & Database" />
                                <ServiceCard name="The Movie Database" role="(TMDB API) Data Provider" />
                                <ServiceCard name="Vercel" role="Hosting & Analytics" />
                                <ServiceCard name="Microsoft Clarity" role="User Behavior Analytics" />
                            </div>
                        </section>

                        {/* Section 6 */}
                        <section id="security" className="scroll-mt-32">
                            <SectionHeader number="06" title="Data Security" />
                            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
                                We employ industry-standard security measures (SSL, secure database rules) to protect your information. However, please be aware that no method of transmission over the Internet is 100% secure.
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section id="contact" className="scroll-mt-32">
                            <SectionHeader number="07" title="Contact Us" />
                            <div className="bg-zinc-900 text-zinc-100 p-8 rounded-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/20 transition-colors" />

                                <h3 className="text-xl font-bold mb-2">Data Privacy Request?</h3>
                                <p className="text-zinc-400 mb-6">If you wish to request data deletion or have privacy concerns.</p>

                                <a href="mailto:grv.9604@gmail.com" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-200 transition-colors">
                                    Contact Privacy Officer
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

function DataPoint({ icon, title, desc }: { icon: string; title: string; desc: string }) {
    return (
        <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                {/* Simple Icons based on props */}
                {icon === 'Identity' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                {icon === 'Movie' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                {icon === 'Graph' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            </div>
            <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{title}</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{desc}</p>
            </div>
        </div>
    );
}

function ServiceCard({ name, role }: { name: string; role: string }) {
    return (
        <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
            <div className="font-semibold text-zinc-800 dark:text-zinc-200">{name}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">{role}</div>
        </div>
    );
}