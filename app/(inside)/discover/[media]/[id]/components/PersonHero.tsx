import Image from 'next/image';
import Link from 'next/link';
import { Person } from '@/lib/types/tmdb';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRightIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { BackButton, ShareButton, BackdropGallery, PortraitGallery, CinematicRow } from './media-interactive';
import SaveButton from '@/app/ui/save/SaveButton';

/* Helper Components */
function InfoBlock({ label, value }: { label: string; value: React.ReactNode }) {
    if (!value) return null;
    return (
        <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{label}</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{value}</span>
        </div>
    );
}

function SocialTag({ href, label }: { href: string; label: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-full hover:border-black dark:hover:border-white transition-colors group bg-white dark:bg-zinc-900 text-xs">
            <span className="font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white">{label}</span>
            <ArrowUpRightIcon className="w-3 h-3 text-zinc-400 group-hover:text-black dark:group-hover:text-white" />
        </a>
    );
}

export function PersonHero({ person }: { person: Person }) {
    // 1. Calculate Age
    const getAge = (birthday: string | null, deathday: string | null) => {
        if (!birthday) return "N/A";
        const birthDate = new Date(birthday);
        const endDate = deathday ? new Date(deathday) : new Date();
        let age = endDate.getFullYear() - birthDate.getFullYear();
        const m = endDate.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) age--;
        return age;
    };
    const age = getAge(person.birthday || null, person.deathday || null);
    const formattedBirthday = person.birthday ? new Date(person.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;

    // 2. Map Gender
    const genderMap: Record<number, string> = { 0: 'Unknown', 1: 'Female', 2: 'Male', 3: 'Non-binary' };
    const genderLabel = genderMap[(person as any).gender] || 'Unknown';

    // 3. Logic for "Famous Movie Backdrop"
    // Find the most popular movie in their credits to use as the hero backdrop
    const famousCredit = person.combined_credits?.cast
        ? [...person.combined_credits.cast].sort((a: any, b: any) => b.popularity - a.popularity)[0]
        : null;

    // We construct a fake images array so the BackdropGallery can use it
    const backdropImages = famousCredit?.backdrop_path
        ? [{ file_path: famousCredit.backdrop_path, iso_639_1: 'en' }]
        : [];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20">
            {/* STICKY HEADER */}
            <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 sticky top-0 z-50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <BackButton />
                    <div className="flex items-center gap-3">
                        <SaveButton itemType="person" itemId={person.id} className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800" />
                        <ShareButton />
                    </div>
                </div>
            </header>

            {/* BACKDROP (Uses Famous Movie) */}
            <div className="relative w-full h-[50vh] lg:h-[60vh]">
                <BackdropGallery images={backdropImages} fallbackPath={null} />
                {famousCredit && (
                    <div className="absolute bottom-4 right-6 z-10 text-[10px] uppercase tracking-widest text-white/50">
                        Featured in: {famousCredit.title || famousCredit.name}
                    </div>
                )}
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 -mt-32 lg:-mt-48">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-24">

                    {/* LEFT COLUMN: Image & Stats */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Profile Image */}
                        <div className="relative aspect-[2/3] w-full bg-zinc-200 dark:bg-zinc-900 rounded-lg overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl">
                            {person.profile_path ? (
                                <Image src={`https://image.tmdb.org/t/p/h632${person.profile_path}`} alt={person.name} fill className="object-cover" priority unoptimized />
                            ) : <div className="flex flex-col items-center justify-center h-full text-zinc-400 bg-zinc-100 dark:bg-zinc-900"><span className="text-xs uppercase font-bold tracking-widest">No Headshot</span></div>}
                        </div>

                        {/* Stats */}
                        <div className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                <InfoBlock label="Known For" value={person.known_for_department} />
                                <InfoBlock label="Gender" value={genderLabel} />
                                <InfoBlock label="Age" value={age} />
                                {person.birthday && <InfoBlock label="Birth Date" value={formattedBirthday} />}
                                <InfoBlock label="Place of Birth" value={person.place_of_birth || "N/A"} />
                            </div>

                            {/* AKA */}
                            {(person as any).also_known_as?.length > 0 && (
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Also Known As</span>
                                    <div className="flex flex-wrap gap-2">
                                        {(person as any).also_known_as.slice(0, 4).map((alias: string, i: number) => (
                                            <Badge key={i} variant="outline" className="text-zinc-500 border-zinc-300 dark:border-zinc-700">{alias}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Socials */}
                            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-2">
                                {(person as any).external_ids?.instagram_id && <SocialTag href={`https://instagram.com/${(person as any).external_ids.instagram_id}`} label="IG" />}
                                {(person as any).external_ids?.twitter_id && <SocialTag href={`https://twitter.com/${(person as any).external_ids.twitter_id}`} label="TW" />}
                                {(person as any).external_ids?.imdb_id && <SocialTag href={`https://www.imdb.com/name/${(person as any).external_ids.imdb_id}`} label="IMDb" />}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Bio & Credits */}
                    <div className="lg:col-span-3 space-y-10 lg:mt-48">
                        <div className="space-y-3">
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-light tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
                                {person.name}
                            </h1>
                            {person.deathday && <p className="text-lg text-zinc-500 font-light">{formattedBirthday} – {new Date(person.deathday).getFullYear()}</p>}
                        </div>

                        <div className="space-y-4 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Biography</h2>
                            <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 font-light">
                                {person.biography ? person.biography.split('\n\n').map((p, i) => <p key={i}>{p}</p>) : <p className="italic text-zinc-500">No biography available.</p>}
                            </div>
                        </div>

                        {/* Known For Grid */}
                        {person.combined_credits?.cast && person.combined_credits.cast.length > 0 && (
                            <div className="pt-10">
                                <CinematicRow
                                    title="Known For"
                                    items={person.combined_credits.cast.sort((a: any, b: any) => b.popularity - a.popularity).slice(0, 15)}
                                    href={`/search?q=${person.name}`}
                                />
                            </div>
                        )}

                        {/* Photos Gallery */}
                        {person.images?.profiles && person.images.profiles.length > 0 && (
                            <div className="pt-10">
                                <PortraitGallery images={person.images.profiles} />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}