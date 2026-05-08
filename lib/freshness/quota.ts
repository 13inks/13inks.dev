// Doc Refresh — Free-tier quota
// 2 anonymous diagnoses per fingerprint per rolling 7-day window.
// Append-only flat-file ledger. Salted SHA-256 of fingerprint for storage —
// the on-disk hash is never reversible to the client UUID even if the file leaks.

import { appendFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import { dirname } from "path";
import crypto from "crypto";

const QUOTA_PATH =
  process.env.FRESHNESS_QUOTA_PATH || ".data/freshness_quota.jsonl";

// Refuse to start in production with the dev fallback salt. A predictable
// salt + a leaked quota ledger would let an attacker test whether specific
// fingerprints visited. Eager check at module load — fails fast at boot,
// never serves a request with the bad salt.
if (
  (process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production") &&
  !process.env.FRESHNESS_FP_SALT
) {
  throw new Error(
    "FRESHNESS_FP_SALT must be set in production. Refusing to start with the dev-only fallback salt.",
  );
}

const FP_SALT =
  process.env.FRESHNESS_FP_SALT ||
  "dev-only-salt-set-FRESHNESS_FP_SALT-in-prod";

const WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const FREE_LIMIT = 2;

export interface QuotaState {
  used: number;
  remaining: number;
  resetAt: string;
}

export const QUOTA_CONFIG = {
  windowDays: 7,
  freeLimit: FREE_LIMIT,
};

interface QuotaLine {
  fp: string;
  ts: string;
}

/**
 * Salt + hash a client-supplied fingerprint. Truncated to 16 hex chars
 * so the on-disk ledger stays compact and the hash is non-reversible.
 */
export function hashFingerprint(fingerprint: string): string {
  return crypto
    .createHash("sha256")
    .update(FP_SALT + ":" + fingerprint)
    .digest("hex")
    .slice(0, 16);
}

async function ensureQuotaDir(): Promise<void> {
  const dir = dirname(QUOTA_PATH);
  if (dir && !existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

async function readEntries(): Promise<QuotaLine[]> {
  if (!existsSync(QUOTA_PATH)) return [];
  const raw = await readFile(QUOTA_PATH, "utf-8");
  return raw
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => {
      try {
        return JSON.parse(l) as QuotaLine;
      } catch {
        return null;
      }
    })
    .filter((x): x is QuotaLine => x !== null);
}

/**
 * Read-only: how many free analyses has this fingerprint used in the
 * rolling 7-day window?
 */
export async function getUsage(fingerprintHash: string): Promise<QuotaState> {
  const entries = await readEntries();
  const cutoff = Date.now() - WINDOW_MS;
  const recent = entries.filter(
    (e) => e.fp === fingerprintHash && new Date(e.ts).getTime() >= cutoff,
  );
  const used = recent.length;
  const remaining = Math.max(0, FREE_LIMIT - used);

  // resetAt = oldest recent entry + window. With nothing in window, "now".
  let resetAt = new Date().toISOString();
  if (recent.length > 0) {
    const oldest = recent
      .map((e) => new Date(e.ts).getTime())
      .reduce((a, b) => Math.min(a, b));
    resetAt = new Date(oldest + WINDOW_MS).toISOString();
  }

  return { used, remaining, resetAt };
}

/**
 * Try to consume a free analysis. Returns ok=true if consumption succeeded;
 * ok=false if the fingerprint is already at or above the limit.
 *
 * Note: this is the entire "rate limit" — at static-text-analysis cost,
 * we accept the small race window between read and append. Two simultaneous
 * requests from one fingerprint could both succeed at the boundary; that
 * over-grants by one which is fine. Hardening is a v2 concern.
 */
export async function consumeOne(
  fingerprintHash: string,
): Promise<{ ok: boolean; state: QuotaState }> {
  const state = await getUsage(fingerprintHash);
  if (state.remaining <= 0) {
    return { ok: false, state };
  }

  await ensureQuotaDir();
  await appendFile(
    QUOTA_PATH,
    JSON.stringify({ fp: fingerprintHash, ts: new Date().toISOString() }) +
      "\n",
  );

  return {
    ok: true,
    state: {
      used: state.used + 1,
      remaining: state.remaining - 1,
      resetAt: state.resetAt,
    },
  };
}
