// Doc Refresh — Static CLAUDE.md Drift Analyzer
// Deterministic claim extraction + heuristic staleness scoring
// No DB dependency, no LLM call. Pure text analysis.

export interface Claim {
  type: ClaimType;
  text: string;
  value: string;
  line: number;
  staleScore: number; // 0-100, higher = more likely stale
  reason: string;
}

export type ClaimType =
  | "count"
  | "date"
  | "version"
  | "path"
  | "status"
  | "command"
  | "architecture";

export interface DriftReport {
  overallScore: number; // 0-100, higher = more drift risk
  claims: Claim[];
  summary: {
    total: number;
    high: number; // score >= 70
    medium: number; // score 40-69
    low: number; // score < 40
  };
  suggestions: string[];
}

export interface PatternRecord {
  type: ClaimType;
  context: string; // nearby noun/keyword
  value: string;
  staleScore: number;
  ts: string;
}

// ───────────────────────────────────────────────────────────────
// Claim Extractors
// ───────────────────────────────────────────────────────────────

const COUNT_PATTERN =
  /(\d{2,})\s*(tests?|tools?|crates?|endpoints?|models?|lines?|files?|modules?|warnings?|passing|rows?|steps?|components?)/gi;

const DATE_PATTERN =
  /(?:as of|updated|since|dated?)\s+(\w+\s+\d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2}|\w+\s+\d{4})/gi;

const VERSION_PATTERN =
  /v?(\d+\.\d+(?:\.\d+)?)/g;

const PATH_PATTERN =
  /(?:`|"|')?((?:~\/|\.\/|\/)?(?:[\w.-]+\/){2,}[\w.-]+)(?:`|"|')?/g;

const STATUS_PATTERN =
  /\b(WIP|TODO|FIXME|HACK|soon|in progress|upcoming|planned|currently|now (?:uses?|runs?|has)|incomplete|partial(?:ly)?)\b/gi;

const COMMAND_PATTERN =
  /```(?:bash|sh|shell)?\n([\s\S]*?)```/g;

const ARCH_PATTERN =
  /(\d+)\s*(crates?|binaries|services?|databases?|tables?|layers?|tiers?|nodes?)/gi;

function extractCounts(text: string, lines: string[]): Claim[] {
  const claims: Claim[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(COUNT_PATTERN.source, COUNT_PATTERN.flags);

  while ((match = re.exec(text)) !== null) {
    const num = parseInt(match[1]);
    const noun = match[2].toLowerCase();
    const line = lineNumber(text, match.index, lines);

    // Higher numbers are more volatile
    const volatility = num > 100 ? 75 : num > 20 ? 60 : 40;

    claims.push({
      type: "count",
      text: match[0],
      value: `${num} ${noun}`,
      line,
      staleScore: volatility,
      reason: `Numeric claim "${num} ${noun}" — counts drift as code evolves`,
    });
  }
  return claims;
}

function extractDates(text: string, lines: string[]): Claim[] {
  const claims: Claim[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(DATE_PATTERN.source, DATE_PATTERN.flags);

  while ((match = re.exec(text)) !== null) {
    const dateStr = match[1];
    const line = lineNumber(text, match.index, lines);
    const age = estimateAgeDays(dateStr);
    const staleScore = age > 90 ? 90 : age > 30 ? 70 : age > 7 ? 40 : 10;

    claims.push({
      type: "date",
      text: match[0],
      value: dateStr,
      line,
      staleScore,
      reason:
        age > 30
          ? `Date reference is ~${age} days old — verify still accurate`
          : `Recent date reference (~${age} days)`,
    });
  }
  return claims;
}

function extractVersions(text: string, lines: string[]): Claim[] {
  const claims: Claim[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(VERSION_PATTERN.source, VERSION_PATTERN.flags);

  while ((match = re.exec(text)) !== null) {
    const ver = match[1];
    const line = lineNumber(text, match.index, lines);
    // Patch versions drift faster than major
    const parts = ver.split(".");
    const staleScore = parts.length >= 3 ? 55 : 35;

    claims.push({
      type: "version",
      text: match[0],
      value: ver,
      line,
      staleScore,
      reason: `Version "${ver}" — verify this hasn't been bumped`,
    });
  }
  return claims;
}

function extractPaths(text: string, lines: string[]): Claim[] {
  const claims: Claim[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(PATH_PATTERN.source, PATH_PATTERN.flags);

  while ((match = re.exec(text)) !== null) {
    const path = match[1];
    const line = lineNumber(text, match.index, lines);

    // Deeper paths are more fragile
    const depth = path.split("/").length;
    const staleScore = depth > 5 ? 60 : depth > 3 ? 45 : 30;

    claims.push({
      type: "path",
      text: match[0],
      value: path,
      line,
      staleScore,
      reason: `File path reference — verify it still exists at this location`,
    });
  }
  return claims;
}

function extractStatus(text: string, lines: string[]): Claim[] {
  const claims: Claim[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(STATUS_PATTERN.source, STATUS_PATTERN.flags);

  while ((match = re.exec(text)) !== null) {
    const status = match[1];
    const line = lineNumber(text, match.index, lines);

    const highRisk = ["WIP", "TODO", "FIXME", "soon", "upcoming", "planned"];
    const isHigh = highRisk.some(
      (h) => status.toLowerCase() === h.toLowerCase()
    );
    const staleScore = isHigh ? 85 : 50;

    claims.push({
      type: "status",
      text: match[0],
      value: status,
      line,
      staleScore,
      reason: isHigh
        ? `"${status}" is a temporal marker that often goes stale`
        : `Status claim "${status}" — verify this is still the current state`,
    });
  }
  return claims;
}

function extractCommands(text: string, lines: string[]): Claim[] {
  const claims: Claim[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(COMMAND_PATTERN.source, COMMAND_PATTERN.flags);

  while ((match = re.exec(text)) !== null) {
    const block = match[1].trim();
    const line = lineNumber(text, match.index, lines);
    const cmds = block.split("\n").filter((l) => l.trim().length > 0);

    for (const cmd of cmds) {
      claims.push({
        type: "command",
        text: cmd.trim(),
        value: cmd.trim(),
        line,
        staleScore: 45,
        reason: `CLI command — verify flags and binary names still work`,
      });
    }
  }
  return claims;
}

function extractArchitecture(text: string, lines: string[]): Claim[] {
  const claims: Claim[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(ARCH_PATTERN.source, ARCH_PATTERN.flags);

  while ((match = re.exec(text)) !== null) {
    const num = parseInt(match[1]);
    const noun = match[2].toLowerCase();
    const line = lineNumber(text, match.index, lines);

    claims.push({
      type: "architecture",
      text: match[0],
      value: `${num} ${noun}`,
      line,
      staleScore: 65,
      reason: `Structural claim "${num} ${noun}" — architecture grows over time`,
    });
  }
  return claims;
}

// ───────────────────────────────────────────────────────────────
// Main Analyzer
// ───────────────────────────────────────────────────────────────

export function analyze(markdownText: string): DriftReport {
  const lines = markdownText.split("\n");

  const claims: Claim[] = [
    ...extractCounts(markdownText, lines),
    ...extractDates(markdownText, lines),
    ...extractVersions(markdownText, lines),
    ...extractPaths(markdownText, lines),
    ...extractStatus(markdownText, lines),
    ...extractCommands(markdownText, lines),
    ...extractArchitecture(markdownText, lines),
  ];

  // Deduplicate (same line + same value)
  const seen = new Set<string>();
  const deduped = claims.filter((c) => {
    const key = `${c.line}:${c.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by staleness score descending
  deduped.sort((a, b) => b.staleScore - a.staleScore);

  const high = deduped.filter((c) => c.staleScore >= 70).length;
  const medium = deduped.filter(
    (c) => c.staleScore >= 40 && c.staleScore < 70
  ).length;
  const low = deduped.filter((c) => c.staleScore < 40).length;

  // Overall score: weighted average biased toward high-risk claims
  const overallScore =
    deduped.length === 0
      ? 0
      : Math.round(
          (high * 90 + medium * 55 + low * 20) / deduped.length
        );

  const suggestions = generateSuggestions(deduped);

  return {
    overallScore,
    claims: deduped,
    summary: { total: deduped.length, high, medium, low },
    suggestions,
  };
}

// ───────────────────────────────────────────────────────────────
// Pattern Storage — anonymized telemetry for scoring improvement
// ───────────────────────────────────────────────────────────────

export function extractPatterns(report: DriftReport): PatternRecord[] {
  return report.claims.map((claim) => ({
    type: claim.type,
    context: extractContext(claim.text),
    value: claim.value,
    staleScore: claim.staleScore,
    ts: new Date().toISOString(),
  }));
}

function extractContext(text: string): string {
  // Extract the noun/keyword near the claim, strip specific values
  const words = text.split(/\s+/).filter((w) => w.length > 2 && !/^\d+$/.test(w));
  return words.slice(0, 3).join(" ").toLowerCase();
}

// ───────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────

function lineNumber(text: string, charIndex: number, _lines: string[]): number {
  const before = text.slice(0, charIndex);
  return before.split("\n").length;
}

function estimateAgeDays(dateStr: string): number {
  const now = new Date();
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    // Try "Month YYYY" format
    const monthYear = dateStr.match(/(\w+)\s+(\d{4})/);
    if (monthYear) {
      const d = new Date(`${monthYear[1]} 1, ${monthYear[2]}`);
      if (!isNaN(d.getTime())) {
        return Math.floor((now.getTime() - d.getTime()) / 86400000);
      }
    }
    return 30; // Unknown date, assume ~1 month
  }
  return Math.floor((now.getTime() - parsed.getTime()) / 86400000);
}

function generateSuggestions(claims: Claim[]): string[] {
  const suggestions: string[] = [];
  const types = new Map<ClaimType, number>();

  for (const c of claims) {
    if (c.staleScore >= 70) {
      types.set(c.type, (types.get(c.type) || 0) + 1);
    }
  }

  if (types.has("status")) {
    suggestions.push(
      "Remove or resolve temporal markers (WIP, TODO, soon) — they signal neglect to AI tools reading your doc"
    );
  }
  if (types.has("count")) {
    suggestions.push(
      "Replace exact counts with ranges or remove them — numbers go stale fastest"
    );
  }
  if (types.has("date")) {
    suggestions.push(
      "Update or remove date references older than 30 days — stale dates undermine trust"
    );
  }
  if (types.has("architecture")) {
    suggestions.push(
      "Verify structural claims (number of crates, services, etc.) match current reality"
    );
  }
  if (types.has("path")) {
    suggestions.push(
      "Spot-check file paths — restructuring often leaves dead references"
    );
  }

  if (suggestions.length === 0) {
    suggestions.push("Your doc looks fresh — no high-risk claims detected");
  }

  return suggestions;
}
