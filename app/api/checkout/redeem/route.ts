// After Stripe Checkout success, the frontend lands on
// /freshness?session_id=cs_test_... and POSTs that here. We verify the
// session against Stripe directly (race-free vs. webhook timing), mint a
// one-shot paid_token, write it to .data/paid_tokens.jsonl, and return it.
// The frontend then submits /api/check-freshness with paid:true + token.

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { mintToken, recordToken, PaidScope } from "@/lib/stripe/paid_tokens";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { session_id?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const sessionId = body.session_id;
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "invalid_session_id" }, { status: 400 });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return NextResponse.json(
      { error: "not_paid", payment_status: session.payment_status },
      { status: 402 },
    );
  }

  const mode = session.metadata?.mode;
  if (mode !== "single" && mode !== "bundle") {
    return NextResponse.json(
      { error: "not_a_one_time_check", mode: mode ?? null },
      { status: 400 },
    );
  }

  const token = mintToken();
  await recordToken({
    token,
    scope: mode as PaidScope,
    stripe_session_id: sessionId,
    issued_at: Date.now(),
  });

  return NextResponse.json({ token, scope: mode });
}
