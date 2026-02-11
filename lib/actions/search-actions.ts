'use server'

import { createClient } from '@/lib/supabase/server';
import { ProfileSearchResult } from '@/lib/definitions';

export async function searchUsers(query: string): Promise<ProfileSearchResult[]> {
    if (!query || query.length < 2) return [];

    const supabase = await createClient();

    // 1. Search Logic
    // Matches username OR full_name (case-insensitive)
    // Limits to 10 to keep it fast
    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, role, tier')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10);

    if (error) {
        console.error('User Search Error:', error);
        return [];
    }

    return data as ProfileSearchResult[];
}