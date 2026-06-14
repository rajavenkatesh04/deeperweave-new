import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://deeperweave.com';

// Section-level pages only — individual movie/TV/person URLs are excluded
// intentionally so search engines surface discovery hubs, not long-tail entries.
const STATIC_ROUTES: MetadataRoute.Sitemap = [
    {
        url: `${BASE_URL}/`,
        changeFrequency: 'monthly',
        priority: 1.0,
    },
    {
        url: `${BASE_URL}/discover`,
        changeFrequency: 'daily',
        priority: 0.9,
    },
    {
        url: `${BASE_URL}/discover/now-in-theatres`,
        changeFrequency: 'daily',
        priority: 0.8,
    },
    {
        url: `${BASE_URL}/discover/coming-soon`,
        changeFrequency: 'daily',
        priority: 0.7,
    },
    {
        url: `${BASE_URL}/explore`,
        changeFrequency: 'weekly',
        priority: 0.7,
    },
    {
        url: `${BASE_URL}/blogs`,
        changeFrequency: 'daily',
        priority: 0.8,
    },
    {
        url: `${BASE_URL}/features`,
        changeFrequency: 'monthly',
        priority: 0.4,
    },
    {
        url: `${BASE_URL}/subscribe`,
        changeFrequency: 'monthly',
        priority: 0.5,
    },
    {
        url: `${BASE_URL}/policies`,
        changeFrequency: 'yearly',
        priority: 0.2,
    },
    {
        url: `${BASE_URL}/policies/privacy`,
        changeFrequency: 'yearly',
        priority: 0.2,
    },
    {
        url: `${BASE_URL}/policies/terms`,
        changeFrequency: 'yearly',
        priority: 0.2,
    },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Fetch published blog posts once the blog UI ships.
    // Remove the early-return guard and uncomment the block below.
    const blogPosts: MetadataRoute.Sitemap = [];

    // const supabase = await createClient();
    // const { data: posts } = await supabase
    //     .from('posts')
    //     .select('slug, published_at, updated_at')
    //     .eq('is_published', true)
    //     .order('published_at', { ascending: false });
    //
    // const blogPosts: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    //     url: `${BASE_URL}/blogs/${post.slug}`,
    //     lastModified: post.updated_at ?? post.published_at,
    //     changeFrequency: 'weekly',
    //     priority: 0.7,
    // }));

    return [...STATIC_ROUTES, ...blogPosts];
}