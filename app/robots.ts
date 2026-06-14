import { MetadataRoute } from 'next';

// IMPORTANT: Verify every user-agent string below against the official provider docs
// before deploying — these strings change without notice.
//
// Training crawlers (blocked):
//   GPTBot            → https://platform.openai.com/docs/gptbot
//   ClaudeBot         → https://support.anthropic.com/en/articles/8896518-about-the-claudebot-web-crawler
//   CCBot             → https://commoncrawl.org/ccbot
//   Meta-ExternalAgent→ https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/
//   Bytespider        → no official docs; verify via IP range or reverse-DNS
//
// Search / retrieval bots (intentionally NOT listed → they inherit the wildcard rule):
//   OAI-SearchBot     → https://platform.openai.com/docs/plugins/production/bot
//   ChatGPT-User      → https://platform.openai.com/docs/chatgpt-user
//   PerplexityBot     → https://docs.perplexity.ai/guides/bots
//   Claude-SearchBot  → https://support.anthropic.com/
//   Claude-User       → https://support.anthropic.com/
//   Googlebot         → https://developers.google.com/search/docs/crawling-indexing/googlebot
//   Bingbot           → https://www.bing.com/webmaster/help/which-crawlers-does-bing-use-8c184ec0

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://deeperweave.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            // Block training-only crawlers entirely
            {
                userAgent: [
                    'GPTBot',
                    'ClaudeBot',
                    'CCBot',
                    'Meta-ExternalAgent',
                    'Bytespider',
                ],
                disallow: ['/'],
            },
            // All other bots (including Googlebot, Bingbot, OAI-SearchBot,
            // ChatGPT-User, PerplexityBot, Claude-SearchBot, Claude-User)
            {
                userAgent: '*',
                allow: [
                    '/discover',
                    '/explore',
                    '/blogs',
                    '/features',
                    '/subscribe',
                    '/policies',
                ],
                disallow: [
                    // API routes — no crawl value, burns function quota
                    '/api/',
                    // Search generates infinite URL combinations
                    '/search',
                    // Auth flows — no SEO value
                    '/auth/',
                    '/onboarding',
                    '/scenes/',
                    // Private profile sub-pages
                    '/profile/edit',
                    '/profile/settings',
                    '/profile/subscriptions',
                    '/profile/notifications',
                    '/profile/saved',
                    '/profile/reviews/create',
                    '/profile/delete',
                    // Filter / query-string routes that create infinite URL space
                    '/discover/adult',
                ],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}