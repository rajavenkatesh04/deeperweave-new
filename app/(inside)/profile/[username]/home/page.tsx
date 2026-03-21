import { Suspense } from 'react';
import { getProfileMetadata, getProfileSections } from '@/lib/data/profile-data';
import { notFound } from 'next/navigation';
import { ProfileSectionsDisplay } from '@/app/ui/profile/ProfileSectionsDisplay';
import { WelcomeModal } from './WelcomeModal';
import { LayoutTemplate } from 'lucide-react';

export default async function ProfileHomePage({
                                                  params,
                                              }: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;

    // 1. Fetch Profile
    const profile = await getProfileMetadata(username);
    if (!profile) notFound();

    // 2. Fetch Sections (Now passing both ID and Username for correct caching)
    const sections = await getProfileSections(profile.id);

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-24">

            {/* ── Widget stack placeholder ── */}
            <section>
                <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-6 flex items-center gap-4 text-zinc-400">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        <LayoutTemplate className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Widgets</p>
                        <p className="text-xs text-zinc-400 mt-0.5">Customisable widgets are coming soon.</p>
                    </div>
                </div>
            </section>

            {/* ── Showcase sections ── */}
            {sections.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 pb-4">Showcase</h2>
                    <ProfileSectionsDisplay sections={sections} />
                </section>
            )}

            {/* ── Welcome modal (client, URL-driven) ── */}
            <Suspense fallback={null}>
                <WelcomeModal />
            </Suspense>
        </div>
    );
}