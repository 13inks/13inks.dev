// POST /api/generate-claudemd
// Tier-gated CLAUDE.md generation from repo-derived inputs.
// - Anonymous free: shares the same fingerprint quota as /api/check-freshness
//   (2 free per rolling 7-day window per fingerprint).
// - Paid one-time ($1) or subscriber: same — paid_token redeems the gate.
// Inputs are processed in memory and discarded with the request scope.
// Nothing is logged or persisted.

import { NextResponse } from "next/server";
import { extractFacts } from "@/lib/generator/extract";
import { compose } from "@/lib/generator/compose";
import { GenerateInputs } from "@/lib/generator/types";
import { consumeOne, hashFingerprint } from "@/lib/freshness/quota";
import { consumeToken } from "@/lib/stripe/paid_tokens";

interface GenerateBody {
  inputs?: GenerateInputs;
  fingerprint?: string;
  paid?: boolean;
  paid_token?: string;
}

const MAX_TOTAL_INPUT_BYTES = 100_000;

function totalInputSize(inputs: GenerateInputs): number {
  let n = 0;
  if (inputs.packageJson) n += inputs.packageJson.length;
  if (inputs.readme) n += inputs.readme.length;
  if (inputs.dirListing) n += inputs.dirListing.join("\n").length;
  return n;
}

export async function POST(request: Request) {
  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { inputs, fingerprint, paid, paid_token } = body;

  if (!inputs || typeof inputs !== "object") {
    return NextResponse.json(
      { error: "Missing 'inputs' field — provide packageJson / readme / dirListing" },
      { status: 400 },
    );
  }

  if (
    !inputs.packageJson &&
    !inputs.readme &&
    (!inputs.dirListing || inputs.dirListing.length === 0)
  ) {
    return NextResponse.json(
      { error: "Need at least one of: packageJson, readme, dirListing" },
      { status: 400 },
    );
  }

  if (totalInputSize(inputs) > MAX_TOTAL_INPUT_BYTES) {
    return NextResponse.json(
      { error: "Inputs too large (max 100KB combined)" },
      { status: 413 },
    );
  }

  // Quota gate — same shape as check-freshness so the two surfaces share
  // the same fingerprint bucket. Generation counts as 1 unit.
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
          message: "You've used your free checks for this week.",
          quota: result.state,
          options: {
            single_check: {
              price_cents: 100,
              label: "Generate now — $1",
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
  } else if (paid_token) {
    const consume = await consumeToken(paid_token);
    if (!consume.ok) {
      return NextResponse.json(
        { error: "paid_token_rejected", reason: consume.reason },
        { status: 402 },
      );
    }
  } else if (process.env.FRESHNESS_DEV_ALLOW_PAID !== "1") {
    return NextResponse.json(
      {
        error: "paid_token_required",
        message: "paid:true requires a paid_token from /api/checkout/redeem.",
      },
      { status: 402 },
    );
  }

  const facts = extractFacts(inputs);
  const result = compose(facts);

  if (paid) {
    return NextResponse.json({
      generated: result.markdown,
      sectionsUsed: result.sectionsUsed,
      tier: "paid" as const,
    });
  }

  return NextResponse.json({
    generated: result.markdown,
    sectionsUsed: result.sectionsUsed,
    tier: "free" as const,
    quota: quotaState,
  });
}
