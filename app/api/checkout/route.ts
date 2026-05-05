import { NextRequest, NextResponse } from "next/server";
import { getStripe, PRICE_IDS, CheckoutMode } from "@/lib/stripe/client";

export const runtime = "nodejs";

function originFromReq(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return env.replace(/\/$/, "");
  const proto = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  let body: { mode?: CheckoutMode; fingerprint?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const mode = body.mode;
  if (mode !== "single" && mode !== "bundle" && mode !== "sub") {
    return NextResponse.json({ error: "invalid_mode" }, { status: 400 });
  }

  let priceId: string;
  try {
    priceId =
      mode === "single" ? PRICE_IDS.single()
      : mode === "bundle" ? PRICE_IDS.bundle()
      : PRICE_IDS.sub();
  } catch (e) {
    return NextResponse.json(
      { error: "stripe_not_configured", detail: (e as Error).message },
      { status: 500 },
    );
  }

  const stripe = getStripe();
  const base = originFromReq(req);

  const session = await stripe.checkout.sessions.create({
    mode: mode === "sub" ? "subscription" : "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/freshness?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/freshness?canceled=1`,
    customer_email: body.email,
    metadata: {
      tag: "freshness.13inks.dev",
      mode,
      fingerprint: body.fingerprint || "",
    },
    ...(mode !== "sub" && {
      payment_intent_data: {
        metadata: {
          tag: "freshness.13inks.dev",
          mode,
          fingerprint: body.fingerprint || "",
        },
      },
    }),
  });

  return NextResponse.json({ url: session.url, session_id: session.id });
}
