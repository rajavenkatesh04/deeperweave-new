import { notFound } from 'next/navigation';
import { getMovieDetails, getTVDetails, getPersonDetails } from '@/lib/tmdb/client';
import { MovieHero } from './components/MovieHero';
import { TVHero } from './components/TVHero';
import { PersonHero } from './components/PersonHero';
import { Metadata } from 'next';
// ✨ FIX: Removed curly braces
import ContentGuard from "@/app/ui/media/ContentGuard";

type Params = Promise<{ media: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { media, id } = await params;
    const tmdbId = parseInt(id);

    if (media === 'movie') {
        const data = await getMovieDetails(tmdbId);
        return { title: `${data?.title || 'Unknown'} • DeeperWeave` };
    }
    if (media === 'tv') {
        const data = await getTVDetails(tmdbId);
        return { title: `${data?.name || 'Unknown'} • DeeperWeave` };
    }
    if (media === 'person') {
        const data = await getPersonDetails(tmdbId);
        return { title: `${data?.name || 'Unknown'} • DeeperWeave` };
    }
    return { title: 'Discover • DeeperWeave' };
}

export default async function DiscoverPage({ params }: { params: Params }) {
    const { media, id } = await params;
    const tmdbId = parseInt(id);

    if (isNaN(tmdbId)) notFound();

    // 1. FETCH DATA
    let data: any = null;
    if (media === 'movie') data = await getMovieDetails(tmdbId);
    else if (media === 'tv') data = await getTVDetails(tmdbId);
    else if (media === 'person') data = await getPersonDetails(tmdbId);

    if (!data) notFound();

    // 2. DETERMINE CONTENT
    let content = null;
    if (media === 'movie') content = <MovieHero media={data} />;
    else if (media === 'tv') content = <TVHero media={data} />;
    else if (media === 'person') content = <PersonHero person={data} />;

    // 3. APPLY GUARD
    // If the API says it's adult content, wrap it.
    // The Client Component will decide if it should reveal based on user settings.
    if (data.adult === true) {
        return (
            <ContentGuard isAdult={true}>
                {content}
            </ContentGuard>
        );
    }

    // 4. STANDARD RENDER
    return content;
}