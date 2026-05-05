// Stripe webhook receiver. Persistence-only — the redeem flow handles
// paid_token minting at user-redirect time so we don't depend on webhook
// timing for the happy path.
//
// Events handled:
//   checkout.session.completed       → log; (paid_token minted by redeem)
//   customer.subscription.deleted    → log
//   invoice.payment_failed           → log
//
// All events are appended to .data/stripe_events.jsonl regardless.

import { NextRequest, NextResponse } from "next/server";
import { appendFile, mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { dirname } from "path";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";

export const runtime = "nodejs";

const EVENTS_PATH =
  process.env.STRIPE_EVENTS_PATH || ".data/stripe_events.jsonl";

async function ensureEventsFile(): Promise<void> {
  if (!existsSync(EVENTS_PATH)) {
    await mkdir(dirname(EVENTS_PATH), { recursive: true });
    await writeFile(EVENTS_PATH, "");
  }
}

async function logEvent(event: Stripe.Event): Promise<void> {
  await ensureEventsFile();
  const summary = {
    id: event.id,
    type: event.type,
    received_at: new Date().toISOString(),
    livemode: event.livemode,
    object_id: (event.data.object as { id?: string }).id ?? null,
  };
  await appendFile(EVENTS_PATH, JSON.stringify(summary) + "\n");
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "webhook_not_configured" },
      { status: 500 },
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const raw = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return NextResponse.json(
      { error: "signature_verification_failed", detail: (err as Error).message },
      { status: 400 },
    );
  }

  await logEvent(event);

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.deleted":
    case "invoice.payment_failed":
      // Logged above. Sub-state machine + grace period handled in a follow-up.
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
