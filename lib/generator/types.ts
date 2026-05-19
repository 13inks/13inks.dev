// Shared types for the CLAUDE.md generator (Tier 1 web + Tier 2 CLI).

export interface GenerateInputs {
  packageJson?: string;
  readme?: string;
  dirListing?: string[];
}

export interface RepoFacts {
  name?: string;
  description?: string;
  framework?: string;
  deployment?: string;
  commands: { label: string; cmd: string; note?: string }[];
  layout: { dir: string; role?: string }[];
  conventions: string[];
}

export type SectionKey =
  | "what_this_is"
  | "how_to_work"
  | "layout"
  | "conventions"
  | "check_before";

export interface ComposeResult {
  markdown: string;
  sectionsUsed: SectionKey[];
  lineCount: number;
}

export interface GenerateResponse {
  generated: string;
  sectionsUsed: SectionKey[];
  tier: "free" | "paid";
  quota?: { used: number; remaining: number; resetAt: string };
}
