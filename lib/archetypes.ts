import { Archetype } from "./questions";

export interface ArchetypeInfo {
  name: Archetype;
  title: string;
  description: string;
  strength: string;
  aiStyle: string;
  color: string;
}

export const ARCHETYPES: Record<Archetype, ArchetypeInfo> = {
  Guardian: {
    name: "Guardian",
    title: "The Sentinel",
    description:
      "You verify before you trust. Systematic, thorough, and precise \u2014 you catch what others miss.",
    strength: "Quality assurance, validation, catching edge cases",
    aiStyle:
      "Your AI should check its work, ask before acting, and never skip validation steps.",
    color: "#3b82f6", // blue
  },
  Architect: {
    name: "Architect",
    title: "The Structuralist",
    description:
      "You see systems before you see code. Clean interfaces, clear boundaries, structural reasoning first.",
    strength: "System design, interface clarity, long-term maintainability",
    aiStyle:
      "Your AI should plan before implementing, explain structural reasoning, and minimize coupling.",
    color: "#8b5cf6", // purple
  },
  Synthesizer: {
    name: "Synthesizer",
    title: "The Researcher",
    description:
      "You gather before you decide. Cross-referencing, pattern-matching, and context-building are your natural moves.",
    strength: "Research, cross-referencing, finding the right approach",
    aiStyle:
      "Your AI should research before recommending, cross-reference sources, and gather context first.",
    color: "#10b981", // green
  },
  Healer: {
    name: "Healer",
    title: "The Fixer",
    description:
      "You find root causes, not band-aids. Clear communication, steady hands, and a bias toward understanding.",
    strength: "Debugging, documentation, supporting teammates",
    aiStyle:
      "Your AI should fix root causes, write clear error messages, and document recovery paths.",
    color: "#f59e0b", // amber
  },
  Creator: {
    name: "Creator",
    title: "The Builder",
    description:
      "You ship. Fast iteration, novel solutions, and a bias toward action over deliberation.",
    strength: "Rapid prototyping, novel approaches, getting things done",
    aiStyle:
      "Your AI should bias toward action, iterate fast, and ship first \u2014 refine later.",
    color: "#ef4444", // red
  },
};
