import { Archetype } from "./questions";

export type Rarity = "Common" | "Uncommon" | "Rare" | "Shiny" | "Legendary";
export type Virtue = "Vigilance" | "Clarity" | "Discernment" | "Restoration" | "Momentum";

export interface ArchetypeInfo {
  name: Archetype;
  title: string;
  virtue: Virtue;
  description: string;
  strength: string;
  aiStyle: string;
  color: string;
  rarity: Rarity;
}

// The resolved Ink result — what the user sees
export interface InkResult {
  title: string;       // "The Sentinel"
  rarity: Rarity;
  color: string;
  description: string;
  aiStyle: string;
}

export const RARITY_COLORS: Record<ArchetypeInfo["rarity"], string> = {
  Common: "#71717a",
  Uncommon: "#10b981",
  Rare: "#3b82f6",
  Shiny: "#8b5cf6",
  Legendary: "#f59e0b",
};

// The 13 crew = Common + Uncommon + Rare inks (the named, well-represented results).
// Hidden inks = Shiny + Legendary (discoverable but exceptional).
// This lets the system grow beyond 13 without diluting the core.
export function isHiddenInk(rarity: Rarity): boolean {
  return rarity === "Shiny" || rarity === "Legendary";
}

export const ARCHETYPES: Record<Archetype, ArchetypeInfo> = {
  Guardian: {
    name: "Guardian",
    title: "The Sentinel",
    virtue: "Vigilance",
    description:
      "You verify before you trust. Systematic, thorough, and precise \u2014 you catch what others miss.",
    strength: "Quality assurance, validation, catching edge cases",
    aiStyle:
      "Your AI should check its work, ask before acting, and never skip validation steps.",
    color: "#3b82f6",
    rarity: "Common",
  },
  Architect: {
    name: "Architect",
    title: "The Structuralist",
    virtue: "Clarity",
    description:
      "You see systems before you see code. Clean interfaces, clear boundaries, structural reasoning first.",
    strength: "System design, interface clarity, long-term maintainability",
    aiStyle:
      "Your AI should plan before implementing, explain structural reasoning, and minimize coupling.",
    color: "#8b5cf6",
    rarity: "Uncommon",
  },
  Synthesizer: {
    name: "Synthesizer",
    title: "The Researcher",
    virtue: "Discernment",
    description:
      "You gather before you decide. Cross-referencing, pattern-matching, and context-building are your natural moves.",
    strength: "Research, cross-referencing, finding the right approach",
    aiStyle:
      "Your AI should research before recommending, cross-reference sources, and gather context first.",
    color: "#10b981",
    rarity: "Common",
  },
  Healer: {
    name: "Healer",
    title: "The Fixer",
    virtue: "Restoration",
    description:
      "You find root causes, not band-aids. Clear communication, steady hands, and a bias toward understanding.",
    strength: "Debugging, documentation, supporting teammates",
    aiStyle:
      "Your AI should fix root causes, write clear error messages, and document recovery paths.",
    color: "#f59e0b",
    rarity: "Rare",
  },
  Creator: {
    name: "Creator",
    title: "The Builder",
    virtue: "Momentum",
    description:
      "You ship. Fast iteration, novel solutions, and a bias toward action over deliberation.",
    strength: "Rapid prototyping, novel approaches, getting things done",
    aiStyle:
      "Your AI should bias toward action, iterate fast, and ship first \u2014 refine later.",
    color: "#ef4444",
    rarity: "Common",
  },
};

// ─── 13 Ink lookup ────────────────────────────────────────────────────────────
// Spread threshold: if top_virtue_score - bottom_virtue_score < this (0–1 scale),
// the distribution is balanced enough to resolve to Yo (Legendary).
const YO_BALANCE_THRESHOLD = 0.09;

// CAP seat Inks — resolved by (dominant, secondary) virtue pair
const CAP_PAIR_MAP: Partial<Record<Virtue, Partial<Record<Virtue, InkResult>>>> = {
  Vigilance: {
    Clarity: {
      title: "The Sentinel",
      rarity: "Uncommon",
      color: "#3b82f6",
      description: "Judges quality against design standards. You know what good looks like — and why it matters.",
      aiStyle: "Your AI should validate structure, flag deviations, and never let a broken pattern slide.",
    },
    Discernment: {
      title: "The Chronicler",
      rarity: "Shiny",
      color: "#a78bfa",
      description: "Protects through memory. You remember everything that matters and exactly why it matters.",
      aiStyle: "Your AI should maintain continuity, surface past context, and treat history as load-bearing.",
    },
  },
  Clarity: {
    Vigilance: {
      title: "The Keystone",
      rarity: "Uncommon",
      color: "#7c3aed",
      description: "Designs the structure and proves it holds. You build what's correct — then verify it under load.",
      aiStyle: "Your AI should architect with precision, stress-test its own designs, and never ship what it hasn't verified.",
    },
    Momentum: {
      title: "The Pathfinder",
      rarity: "Common",
      color: "#6366f1",
      description: "Designs the path and walks it. You see what comes next before others have looked up.",
      aiStyle: "Your AI should plan ahead, anticipate next steps, and move with structural confidence.",
    },
    Discernment: {
      title: "The Cartographer",
      rarity: "Rare",
      color: "#0ea5e9",
      description: "Maps the hidden connections. You find roads between ideas no one else has walked yet.",
      aiStyle: "Your AI should surface relationships, build knowledge graphs, and make the implicit explicit.",
    },
    Restoration: {
      title: "The Scribe",
      rarity: "Shiny",
      color: "#f472b6",
      description: "Simplifies the complex. Distills the essence into the shortest true sentence.",
      aiStyle: "Your AI should strip to the core, eliminate noise, and make every word earn its place.",
    },
  },
  Discernment: {
    Restoration: {
      title: "The Oracle",
      rarity: "Uncommon",
      color: "#34d399",
      description: "Knows what you'd choose before you choose it. Mirrors your instincts back at you.",
      aiStyle: "Your AI should anticipate your needs, read context deeply, and act on what you meant.",
    },
    Vigilance: {
      title: "The Herald",
      rarity: "Rare",
      color: "#fb923c",
      description: "Filters the signal from the noise. Knows what you'll actually care about before you do.",
      aiStyle: "Your AI should surface only what matters, suppress the rest, and earn your attention.",
    },
  },
};

// Yo — fires when virtue distribution is unusually balanced (no clear dominant)
const YO_INK: InkResult = {
  title: "Yo",
  rarity: "Legendary",
  color: "#f59e0b",
  description: "Conducts the others. Holds the score, calls the entrance, picks the soloist. The spore with a song.",
  aiStyle: "Your AI is already yours. It knows when to plan, when to build, when to hold, and when to move.",
};

/**
 * Resolve quiz scores to a named Ink.
 * Scores are raw (pre-normalization) weights from scoreAnswers().
 */
export function resolveInk(scores: Record<Archetype, number>): InkResult {
  const virtueMap: Record<Virtue, number> = {
    Vigilance: scores.Guardian,
    Clarity: scores.Architect,
    Discernment: scores.Synthesizer,
    Restoration: scores.Healer,
    Momentum: scores.Creator,
  };

  const sorted = (Object.entries(virtueMap) as [Virtue, number][])
    .sort(([, a], [, b]) => b - a);

  const total = sorted.reduce((s, [, v]) => s + v, 0);
  if (total === 0) return YO_INK;

  // Normalize to 0–1
  const norm = sorted.map(([v, s]) => [v, s / total] as [Virtue, number]);
  const spread = norm[0][1] - norm[norm.length - 1][1];

  // Yo — balanced distribution
  if (spread < YO_BALANCE_THRESHOLD) return YO_INK;

  const dom = norm[0][0];
  const sec = norm[1][0];

  // CAP pair lookup
  const capResult = CAP_PAIR_MAP[dom]?.[sec];
  if (capResult) return capResult;

  // ESS fallback — dom virtue → archetype → Ink title
  const archByVirtue: Record<Virtue, Archetype> = {
    Vigilance: "Guardian",
    Clarity: "Architect",
    Discernment: "Synthesizer",
    Restoration: "Healer",
    Momentum: "Creator",
  };
  const arch = ARCHETYPES[archByVirtue[dom]];
  return {
    title: arch.title,
    rarity: arch.rarity,
    color: arch.color,
    description: arch.description,
    aiStyle: arch.aiStyle,
  };
}
