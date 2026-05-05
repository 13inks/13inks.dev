// POST /api/check-freshness
// Tier-gated drift analysis.
// - Anonymous free: 2 analyses per fingerprint per rolling 7-day window;
//   response includes drift score + claims only (no rewrites).
// - Paid one-time ($1) or subscriber: full package — score + claims +
//   suggestions. Doesn't consume the free quota.
// Stores anonymized patterns regardless of tier.

import { NextResponse } from "next/server";
import { analyze, extractPatterns } from "@/lib/freshness/analyzer";
import { storePatterns, initStore } from "@/lib/freshness/store";
import {
  consumeOne,
  hashFingerprint,
  QUOTA_CONFIG,
} from "@/lib/freshness/quota";

interface CheckBody {
  text?: string;
  fingerprint?: string;
  // Set true when the client has just completed Stripe checkout for a
  // one-time refresh of THIS document. The server validates the receipt
  // before honoring it (stub for v1; full Stripe webhook wiring in next phase).
  paid?: boolean;
}

export async function POST(request: Request) {
  let body: CheckBody;
  try {
    body = (await request.json()) as CheckBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { text, fingerprint, paid } = body;

  if (!text || typeof text !== "string") {
    return NextResponse.json(
      { error: "Missing 'text' field — paste your CLAUDE.md content" },
      { status: 400 },
    );
  }

  if (text.length > 100_000) {
    return NextResponse.json(
      { error: "Document too large (max 100KB)" },
      { status: 413 },
    );
  }

  // Quota gate (skipped for paid one-time refresh — those are pre-validated.
  // Until the Stripe webhook is wired, paid=true is dev-only and rejected
  // unless an explicit dev flag is set).
  let quotaState = null;
  if (!paid) {
    if (!fingerprint || typeof fingerprint !== "string") {
      return NextResponse.json(
        { error: "Missing 'fingerprint' (UUID v4 from your browser)" },
        { status: 400 },
      );
    }
    const fpHash = hashFingerprint(fingerprint);
    const result = await consumeOne(fpHash);
    if (!result.ok) {
      return NextResponse.json(
        {
          error: "quota_exhausted",
          message: `You've used your ${QUOTA_CONFIG.freeLimit} free analyses for this ${QUOTA_CONFIG.windowDays}-day window.`,
          quota: result.state,
          options: {
            single_check: {
              price_cents: 100,
              label: "Run this check now — $1",
            },
            subscribe: {
              price_cents: 900,
              label: "Subscribe — $9/mo",
            },
          },
        },
        { status: 402 },
      );
    }
    quotaState = result.state;
  } else if (process.env.FRESHNESS_DEV_ALLOW_PAID !== "1") {
    return NextResponse.json(
      {
        error: "paid_path_not_wired",
        message:
          "Stripe checkout flow ships in the next phase. Set FRESHNESS_DEV_ALLOW_PAID=1 for local testing.",
      },
      { status: 501 },
    );
  }

  const report = analyze(text);

  // Pattern store — fire and forget; never block the user.
  const patterns = extractPatterns(report);
  initStore()
    .then(() => storePatterns(patterns, report.overallScore))
    .catch(() => {});

  // Tier-gated response — free strips the rewrites layer; paid returns it.
  const baseResponse = {
    overallScore: report.overallScore,
    claims: report.claims,
    summary: report.summary,
  };

  if (paid) {
    return NextResponse.json({
      ...baseResponse,
      suggestions: report.suggestions,
      tier: "paid" as const,
    });
  }

  return NextResponse.json({
    ...baseResponse,
    tier: "free" as const,
    quota: quotaState,
  });
}
