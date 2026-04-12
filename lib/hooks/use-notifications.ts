'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { NotificationRecord } from '@/lib/definitions';
import { toast } from 'sonner';

function notifToast(notif: NotificationRecord) {
    const name = notif.metadata?.actor_full_name ?? notif.metadata?.actor_username ?? 'Someone';
    switch (notif.type) {
        case 'new_follower':    toast(`${name} started following you`); break;
        case 'follow_request':  toast(`${name} wants to follow you`); break;
        case 'follow_accepted': toast(`${name} accepted your follow request`); break;
        case 'like':            toast(`${name} liked your review`); break;
        case 'comment':         toast(`${name} commented on your review`); break;
        case 'mention':         toast(`${name} mentioned you`); break;
    }
}

export function useNotifications(userId: string, initialNotifications: NotificationRecord[] = []) {
    const [notifications, setNotifications] = useState<NotificationRecord[]>(initialNotifications);
    const [unreadCount, setUnreadCount]     = useState(() => initialNotifications.filter(n => !n.is_read).length);
    const supabase  = useMemo(() => createClient(), []);
    // Keep a stable ref so refetch can be called inside callbacks
    const notifsRef = useRef(notifications);
    notifsRef.current = notifications;

    const refetch = useCallback(async () => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('recipient_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (data) {
            setNotifications(data as NotificationRecord[]);
            setUnreadCount((data as NotificationRecord[]).filter(n => !n.is_read).length);
        }
    }, [supabase, userId]);

    // Realtime subscription — new notifications pushed instantly
    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event:  'INSERT',
                    schema: 'public',
                    table:  'notifications',
                    filter: `recipient_id=eq.${userId}`,
                },
                (payload) => {
                    const newNotif = payload.new as NotificationRecord;
                    setNotifications(prev => [newNotif, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    notifToast(newNotif);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId, supabase]);

    // Mark a single notification as read (optimistic)
    const markAsRead = useCallback(async (notifId: string) => {
        setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(prev - 1, 0));

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notifId);
    }, [supabase]);

    // Mark all as read via RPC (optimistic)
    const markAllRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);

        const { error } = await supabase.rpc('mark_all_notifications_read', {
            p_user_id: userId,
        });

        if (error) {
            console.error('mark_all_notifications_read error:', JSON.stringify(error));
            toast.error('Failed to mark notifications as read.');
            refetch();
        }
    }, [supabase, userId, refetch]);

    // Dismiss a single notification (optimistic)
    const clearNotification = useCallback(async (notifId: string) => {
        const removed = notifsRef.current.find(n => n.id === notifId);
        setNotifications(prev => prev.filter(n => n.id !== notifId));
        if (removed && !removed.is_read) setUnreadCount(prev => Math.max(prev - 1, 0));

        const { error } = await supabase.rpc('clear_notification', {
            p_user_id:         userId,
            p_notification_id: notifId,
        });

        if (error) {
            console.error('clear_notification error:', JSON.stringify(error));
            toast.error('Failed to dismiss notification.');
            refetch();
        }
    }, [supabase, userId, refetch]);

    // Clear all notifications (optimistic)
    const clearAll = useCallback(async () => {
        const prev = notifsRef.current;
        setNotifications([]);
        setUnreadCount(0);

        const { error } = await supabase.rpc('clear_all_notifications', {
            p_user_id: userId,
        });

        if (error) {
            console.error('clear_all_notifications error:', JSON.stringify(error));
            setNotifications(prev);
            setUnreadCount(prev.filter(n => !n.is_read).length);
            toast.error('Failed to clear notifications.');
        }
    }, [supabase, userId]);

    return { notifications, unreadCount, markAsRead, markAllRead, clearNotification, clearAll };
}
