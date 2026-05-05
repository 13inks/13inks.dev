// Liveness/readiness probe. Plain GET, returns 200 with minimal info so an
// nginx upstream healthcheck or AWS ELB target group can keep this node in
// rotation. Does NOT touch Stripe or the filesystem — checks that the
// route handler itself is alive. A fuller readiness check (writeable .data
// dir, stripe key reachable) lives at /api/health/ready when we need it.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "freshness.13inks.dev",
      ts: new Date().toISOString(),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
