import LandingPageClient from '@/app/ui/landing/LandingPageClient';
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Home',
    description: 'Track your favorite movies, read community blogs, and discover your next cinematic obsession.',
    openGraph: {
        title: 'DeeperWeave - Track, Discover, Write',
        description: 'The ultimate social platform for movie and TV lovers.',
        type: 'website',
    },
};


export default function Home() {
    // We don't need to fetch heroPosters or bentoItems anymore
    // because the new design uses the FeatureCarousel with static Mockups.

    return (
        <main>
            <LandingPageClient />
        </main>
    );
}