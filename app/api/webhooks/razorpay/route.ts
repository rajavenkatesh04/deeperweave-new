/**
 * POST /api/webhooks/razorpay
 *
 * Handles Razorpay webhook events (payment captured, subscription events).
 * Configure this URL in your Razorpay dashboard under Webhooks.
 *
 * Required env vars:
 *   RAZORPAY_WEBHOOK_SECRET  — set in Razorpay dashboard > Webhooks > Secret
 *
 * ── STATUS: Skeleton ready. Fill TODO blocks after Razorpay approval. ──
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { activateSubscription } from '@/lib/actions/subscription-actions';
import { BillingCycle, SUBSCRIPTION_PRICING, TierType } from '@/lib/definitions';
import { createAdminClient } from '@/lib/supabase/admin';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

function verifySignature(body: string, signature: string): boolean {
    if (!WEBHOOK_SECRET) return false;
    const expected = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(body)
        .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/** Calculate subscription expiry from billing cycle */
function computeExpiresAt(billingCycle: BillingCycle): Date {
    const d = new Date();
    if (billingCycle === 'yearly') {
        d.setFullYear(d.getFullYear() + 1);
    } else {
        d.setMonth(d.getMonth() + 1);
    }
    return d;
}

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature') ?? '';

    // 1. Verify webhook signature
    if (!verifySignature(body, signature)) {
        console.error('[Razorpay Webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    let event: Record<string, unknown>;
    try {
        event = JSON.parse(body);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const eventType = event.event as string;
    console.log('[Razorpay Webhook] Event:', eventType);

    switch (eventType) {

        case 'payment.captured': {
            /**
             * Fired when a one-time payment is captured.
             * Extract userId, tier, billingCycle from order notes and activate subscription.
             */
            // TODO: Uncomment and adapt when live
            // const payment = (event as any).payload.payment.entity;
            // const { userId, tier, billingCycle } = payment.notes as {
            //     userId: string;
            //     tier: 'auteur' | 'cineaste';
            //     billingCycle: BillingCycle;
            // };
            // const pricing = SUBSCRIPTION_PRICING[tier as 'auteur' | 'cineaste'];
            // await activateSubscription(
            //     userId,
            //     tier as TierType,
            //     billingCycle,
            //     billingCycle === 'monthly' ? pricing.monthly * 100 : pricing.yearly * 100,
            //     computeExpiresAt(billingCycle),
            //     payment.order_id,
            //     payment.id,
            // );
            break;
        }

        case 'subscription.charged': {
            /**
             * Fired on each recurring charge for a Razorpay Subscription.
             * Extend the user's subscription by one period.
             */
            // TODO: Handle renewal — extend expires_at by one billing period
            break;
        }

        case 'subscription.cancelled': {
            /**
             * Fired when Razorpay cancels the subscription (e.g. payment failure).
             * Mark subscription as cancelled in our DB; pg_cron will downgrade at expiry.
             */
            // TODO:
            // const sub = (event as any).payload.subscription.entity;
            // const admin = await createAdminClient();
            // await admin
            //     .from('subscriptions')
            //     .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
            //     .eq('razorpay_subscription_id', sub.id);
            break;
        }

        case 'payment.failed': {
            // TODO: Notify user that their payment failed
            break;
        }

        default:
            // Unhandled events — safe to ignore
            break;
    }

    return NextResponse.json({ received: true });
}
