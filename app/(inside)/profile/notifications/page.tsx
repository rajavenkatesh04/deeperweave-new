import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NotificationsClient } from './notifications-client';
import { NotificationRecord } from '@/lib/definitions';

export default async function NotificationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    // Initial fetch server-side for fast first paint
    const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

    return (
        <NotificationsClient
            userId={user.id}
            initialNotifications={(notifications ?? []) as NotificationRecord[]}
        />
    );
}
