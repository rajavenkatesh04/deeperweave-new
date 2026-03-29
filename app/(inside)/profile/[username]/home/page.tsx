import { Suspense } from 'react';
import { getProfileMetadata, getProfileSections } from '@/lib/data/profile-data';
import { notFound } from 'next/navigation';
import { ProfileSectionsDisplay } from '@/app/ui/profile/ProfileSectionsDisplay';
import { WelcomeModal } from './WelcomeModal';
import { LayoutTemplate, Plus, Layers } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function ProfileHomePage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;

    const [profile, { data: { user } }] = await Promise.all([
        getProfileMetadata(username),
        (await createClient()).auth.getUser(),
    ]);

    if (!profile) notFound();

    const sections = await getProfileSections(profile.id);

    const isOwner = user?.app_metadata?.username === username;

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
            <section>
                {sections.length > 0 ? (
                    <>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 pb-4">Showcase</h2>
                        <ProfileSectionsDisplay sections={sections} />
                    </>
                ) : isOwner ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 p-8 flex flex-col items-center text-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                Your Showcase is empty
                            </p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed">
                                Sections let you curate your profile — pin favourite films, create lists, and show the world your taste.
                            </p>
                        </div>
                        <Link
                            href="/profile/edit"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add your first section
                        </Link>
                    </div>
                ) : null}
            </section>

            {/* ── Welcome modal (client, URL-driven) ── */}
            <Suspense fallback={null}>
                <WelcomeModal />
            </Suspense>
        </div>
    );
}
