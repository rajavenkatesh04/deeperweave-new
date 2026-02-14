'use server'

import { createClient } from '@/lib/supabase/server';
import { ProfileSearchResult } from '@/lib/definitions';

export async function searchUsers(query: string): Promise<ProfileSearchResult[]> {
    if (!query || query.length < 2) return [];

    const supabase = await createClient();

    // Get current user's content preference from app_metadata
    const { data: { user } } = await supabase.auth.getUser();
    const userContentPref = user?.app_metadata?.content_preference || 'sfw';

    // Build the query
    let searchQuery = supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, role, tier, content_preference')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`);

    // ✅ FILTER: If user has SFW preference, exclude NSFW profiles
    if (userContentPref === 'sfw') {
        searchQuery = searchQuery.neq('content_preference', 'all');
    }

    const { data, error } = await searchQuery.limit(10);

    if (error) {
        console.error('User Search Error:', error);
        return [];
    }

    return data as ProfileSearchResult[];
}