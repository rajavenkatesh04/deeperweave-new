/**
 * POST /api/checkout
 *
 * Creates a Razorpay order and returns order details for client-side checkout.
 *
 * ── STATUS: Stubbed (returns 503 until Razorpay approval) ──
 *
 * When approval arrives:
 *  1. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to env vars
 *  2. npm add razorpay
 *  3. Replace the TODO block below
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BillingCycle, SUBSCRIPTION_PRICING } from '@/lib/definitions';

interface CheckoutRequestBody {
    tier: 'auteur' | 'cineaste';
    billingCycle: BillingCycle;
}

export async function POST(req: NextRequest) {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body: CheckoutRequestBody = await req.json();
    const { tier, billingCycle } = body;

    if (!['auteur', 'cineaste'].includes(tier) || !['monthly', 'yearly'].includes(billingCycle)) {
        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // TODO (Razorpay): Uncomment when key is available
    // import Razorpay from 'razorpay';
    //
    // const razorpay = new Razorpay({
    //     key_id: process.env.RAZORPAY_KEY_ID!,
    //     key_secret: process.env.RAZORPAY_KEY_SECRET!,
    // });
    //
    // const pricing = SUBSCRIPTION_PRICING[tier];
    // const amountPaise = billingCycle === 'monthly'
    //     ? pricing.monthly * 100
    //     : pricing.yearly * 100;
    //
    // const order = await razorpay.orders.create({
    //     amount: amountPaise,
    //     currency: 'INR',
    //     receipt: `sub_${user.id}_${Date.now()}`,
    //     notes: { userId: user.id, tier, billingCycle },
    // });
    //
    // return NextResponse.json({
    //     orderId: order.id,
    //     amount: amountPaise,
    //     currency: 'INR',
    //     keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    //     userName: user.user_metadata?.full_name ?? '',
    //     userEmail: user.email ?? '',
    // });

    return NextResponse.json(
        { error: 'Payments not yet live. Coming soon!' },
        { status: 503 },
    );
}
