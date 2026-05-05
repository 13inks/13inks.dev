import { appendFile, mkdir, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { dirname } from "path";
import crypto from "crypto";

const TOKEN_PATH =
  process.env.PAID_TOKENS_PATH || ".data/paid_tokens.jsonl";

const TTL_MS = 30 * 60 * 1000;

export type PaidScope = "single" | "bundle";

interface TokenRecord {
  token: string;
  scope: PaidScope;
  stripe_session_id: string;
  issued_at: number;
  consumed_at: number | null;
}

export function mintToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

async function ensureFile(): Promise<void> {
  if (!existsSync(TOKEN_PATH)) {
    await mkdir(dirname(TOKEN_PATH), { recursive: true });
    await writeFile(TOKEN_PATH, "");
  }
}

export async function recordToken(rec: Omit<TokenRecord, "consumed_at">): Promise<void> {
  await ensureFile();
  const line: TokenRecord = { ...rec, consumed_at: null };
  await appendFile(TOKEN_PATH, JSON.stringify(line) + "\n");
}

async function readAll(): Promise<TokenRecord[]> {
  await ensureFile();
  const raw = await readFile(TOKEN_PATH, "utf8");
  const out: TokenRecord[] = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try { out.push(JSON.parse(line)); } catch { /* skip malformed */ }
  }
  return out;
}

export type ConsumeResult =
  | { ok: true; scope: PaidScope }
  | { ok: false; reason: "unknown" | "expired" | "consumed" };

export async function consumeToken(token: string): Promise<ConsumeResult> {
  const rows = await readAll();
  const now = Date.now();
  let target: TokenRecord | undefined;
  for (const r of rows) {
    if (r.token === token) target = r;
  }
  if (!target) return { ok: false, reason: "unknown" };
  if (target.consumed_at) return { ok: false, reason: "consumed" };
  if (now - target.issued_at > TTL_MS) return { ok: false, reason: "expired" };

  // Rewrite with consumed_at set on the target row.
  const updated = rows.map((r) =>
    r.token === token ? { ...r, consumed_at: now } : r,
  );
  await writeFile(
    TOKEN_PATH,
    updated.map((r) => JSON.stringify(r)).join("\n") + "\n",
  );
  return { ok: true, scope: target.scope };
}
