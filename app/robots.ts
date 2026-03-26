import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://deeperweave.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/discover', '/explore', '/blogs'],
                disallow: [
                    '/profile/edit',
                    '/profile/settings',
                    '/profile/subscriptions',
                    '/profile/notifications',
                    '/profile/saved',
                    '/profile/reviews/create',
                    '/profile/analytics',
                    '/onboarding',
                    '/auth/',
                    '/search',
                ],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}