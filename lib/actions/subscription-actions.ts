'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { BillingCycle, Subscription, SUBSCRIPTION_PRICING, TierType } from '@/lib/definitions';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActionState {
    error?: string;
    success?: boolean;
}

/** Returned by initiateCheckout. comingSoon=true until Razorpay approval. */
export type CheckoutResult =
    | { comingSoon: true }
    | { orderId: string; amount: number; currency: string; keyId: string };

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Get the current active/trial/recently-cancelled subscription for the
 * authenticated user. Returns null if the user is on the free plan.
 */
export async function getActiveSubscription(): Promise<Subscription | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error || !data) return null;

    const now = new Date();
    // Return the first record that is still "in-flight" (trial, active, or cancelled-but-not-expired)
    return (
        data.find(
            (s: Subscription) =>
                s.status === 'trial' ||
                s.status === 'active' ||
                (s.status === 'cancelled' && s.expires_at && new Date(s.expires_at) > now),
        ) ?? null
    );
}

/**
 * Get full subscription history for the authenticated user.
 */
export async function getSubscriptionHistory(): Promise<Subscription[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as Subscription[];
}

// ─── Initiate Checkout ────────────────────────────────────────────────────────

/**
 * Initiates a subscription checkout.
 *
 * ── CURRENT STATE: Returns { comingSoon: true } (payments not live yet) ──
 *
 * When Razorpay approval is received, replace the TODO block with:
 *   1. Call Razorpay Orders API to create an order
 *   2. Store a pending subscription record in the DB
 *   3. Return { orderId, amount, currency, keyId }
 * The client then opens the Razorpay checkout widget with those details.
 * On payment success, the webhook at /api/webhooks/razorpay activates the sub.
 */
export async function initiateCheckout(
    tier: 'auteur' | 'cineaste',
    billingCycle: BillingCycle,
): Promise<CheckoutResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // TODO (Razorpay): Create order and return details
    // const pricing = SUBSCRIPTION_PRICING[tier];
    // const amountPaise = billingCycle === 'monthly'
    //     ? pricing.monthly * 100
    //     : pricing.yearly * 100;
    //
    // const razorpayOrder = await razorpay.orders.create({
    //     amount: amountPaise,
    //     currency: 'INR',
    //     receipt: `sub_${user.id}_${Date.now()}`,
    //     notes: { userId: user.id, tier, billingCycle },
    // });
    //
    // Store pending subscription
    // await (await createAdminClient()).from('subscriptions').insert({
    //     user_id: user.id,
    //     tier,
    //     status: 'active',  // will be activated by webhook
    //     billing_cycle: billingCycle,
    //     amount_paise: amountPaise,
    //     razorpay_order_id: razorpayOrder.id,
    // });
    //
    // return {
    //     orderId: razorpayOrder.id,
    //     amount: amountPaise,
    //     currency: 'INR',
    //     keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    // };

    return { comingSoon: true };
}

// ─── Cancel ───────────────────────────────────────────────────────────────────

/**
 * Cancels the user's active subscription immediately.
 * Access continues until `expires_at`; the pg_cron job will downgrade at expiry.
 */
export async function cancelSubscription(): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // Find the active paid subscription (not trial)
    const { data: sub, error: fetchErr } = await supabase
        .from('subscriptions')
        .select('id, tier, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (fetchErr || !sub) return { error: 'No active subscription found.' };

    // Mark as cancelled via admin client (bypasses RLS)
    const admin = await createAdminClient();
    const { error: updateErr } = await admin
        .from('subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', sub.id);

    if (updateErr) {
        console.error('Cancel subscription error:', updateErr);
        return { error: 'Failed to cancel subscription. Please try again.' };
    }

    // TODO (Razorpay): If razorpay_subscription_id exists, cancel via Razorpay API too
    // await razorpay.subscriptions.cancel(sub.razorpay_subscription_id);

    revalidatePath('/profile/subscriptions');
    return { success: true };
}

// ─── Activate (called by webhook after payment) ───────────────────────────────

/**
 * Activates a subscription after successful payment verification.
 * Called only from the Razorpay webhook handler.
 * Uses admin client to bypass RLS.
 */
export async function activateSubscription(
    userId: string,
    tier: TierType,
    billingCycle: BillingCycle,
    amountPaise: number,
    expiresAt: Date,
    razorpayOrderId: string,
    razorpayPaymentId: string,
): Promise<void> {
    const admin = await createAdminClient();

    // 1. Expire any existing active subscriptions for this user
    await admin
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('user_id', userId)
        .in('status', ['active', 'trial']);

    // 2. Insert new active subscription record
    const { error: insertErr } = await admin.from('subscriptions').insert({
        user_id: userId,
        tier,
        status: 'active',
        billing_cycle: billingCycle,
        amount_paise: amountPaise,
        currency: 'INR',
        expires_at: expiresAt.toISOString(),
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
    });

    if (insertErr) throw new Error(`Failed to insert subscription: ${insertErr.message}`);

    // 3. Update profiles.tier and subscription_expires_at
    const { error: profileErr } = await admin
        .from('profiles')
        .update({
            tier,
            subscription_expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

    if (profileErr) throw new Error(`Failed to update profile tier: ${profileErr.message}`);
}