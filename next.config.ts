// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    cacheComponents: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'image.tmdb.org',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com', // Google Auth profiles
            }
        ],
        // [Checklist Item 1: Strict Image Optimization]
        // Force unoptimized for external high-volume domains to bypass Vercel Image Optimization limits
        unoptimized: true,
    },
};

export default nextConfig;