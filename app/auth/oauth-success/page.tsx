'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function OAuthSuccess() {
    const router = useRouter();

    useEffect(() => {
        const syncSession = async () => {
            const supabase = createClient();
            await supabase.auth.getSession(); // <-- THIS hydrates client
            router.replace('/onboarding');
        };

        syncSession();
    }, [router]);

    return null;
}
