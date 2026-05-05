// Doc Refresh — Pattern Storage Layer
// Append-only JSONL for anonymized drift patterns.
// No PII, no raw CLAUDE.md content. Only typed claim signals.

import { writeFile, readFile, appendFile } from "fs/promises";
import { existsSync } from "fs";
import { PatternRecord } from "./analyzer";

const STORE_PATH =
  process.env.FRESHNESS_STORE_PATH || ".data/freshness_patterns.jsonl";

export interface AggregateStats {
  totalChecks: number;
  avgScore: number;
  claimTypeDistribution: Record<string, number>;
  topStaleContexts: { context: string; avgScore: number; count: number }[];
}

/**
 * Append pattern records from a single check to the store.
 * Each line is one claim observation — lightweight, append-only.
 */
export async function storePatterns(
  patterns: PatternRecord[],
  overallScore: number
): Promise<void> {
  const checkId = crypto.randomUUID().slice(0, 8);
  const lines = patterns.map((p) =>
    JSON.stringify({ ...p, checkId, overallScore })
  );
  await appendFile(STORE_PATH, lines.join("\n") + "\n");
}

/**
 * Compute aggregate stats from stored patterns.
 * Used for scoring weight improvement and dashboard.
 */
export async function getAggregateStats(): Promise<AggregateStats> {
  if (!existsSync(STORE_PATH)) {
    return {
      totalChecks: 0,
      avgScore: 0,
      claimTypeDistribution: {},
      topStaleContexts: [],
    };
  }

  const raw = await readFile(STORE_PATH, "utf-8");
  const lines = raw
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      totalChecks: 0,
      avgScore: 0,
      claimTypeDistribution: {},
      topStaleContexts: [],
    };
  }

  // Unique checks
  const checkIds = new Set(lines.map((l: any) => l.checkId));
  const totalChecks = checkIds.size;

  // Average overall score (one per check)
  const scoresByCheck = new Map<string, number>();
  for (const line of lines) {
    if (!scoresByCheck.has(line.checkId)) {
      scoresByCheck.set(line.checkId, line.overallScore);
    }
  }
  const avgScore =
    [...scoresByCheck.values()].reduce((a, b) => a + b, 0) / totalChecks;

  // Claim type distribution
  const claimTypeDistribution: Record<string, number> = {};
  for (const line of lines) {
    claimTypeDistribution[line.type] =
      (claimTypeDistribution[line.type] || 0) + 1;
  }

  // Top stale contexts (grouped by context string)
  const contextMap = new Map<
    string,
    { totalScore: number; count: number }
  >();
  for (const line of lines) {
    const ctx = line.context || "unknown";
    const existing = contextMap.get(ctx) || { totalScore: 0, count: 0 };
    existing.totalScore += line.staleScore;
    existing.count += 1;
    contextMap.set(ctx, existing);
  }

  const topStaleContexts = [...contextMap.entries()]
    .map(([context, { totalScore, count }]) => ({
      context,
      avgScore: Math.round(totalScore / count),
      count,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 10);

  return { totalChecks, avgScore: Math.round(avgScore), claimTypeDistribution, topStaleContexts };
}

/**
 * Ensure the storage directory exists.
 */
export async function initStore(): Promise<void> {
  const dir = STORE_PATH.split("/").slice(0, -1).join("/");
  if (dir && !existsSync(dir)) {
    const { mkdir } = await import("fs/promises");
    await mkdir(dir, { recursive: true });
  }
}
