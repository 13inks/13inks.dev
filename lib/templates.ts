import { Archetype } from "./questions";

export interface SkillTemplate {
  name: string;
  description: string;
  content: string;
}

export interface MemoryTemplate {
  name: string;
  description: string;
  type: "feedback" | "user" | "project" | "reference";
  content: string;
}

export const ARCHETYPE_RULES: Record<Archetype, string[]> = {
  Guardian: [
    "Plan before implementing \u2014 outline the approach before writing code.",
    "Validate at system boundaries (user input, external APIs, file I/O).",
    "Prefer explicit over implicit \u2014 no magic, no hidden behavior.",
    "Run tests before committing. If tests don't exist, write them first.",
    "When in doubt, ask \u2014 never assume permissions or intent.",
  ],
  Architect: [
    "Design interfaces before implementation \u2014 define the contract first.",
    "Minimize coupling between components \u2014 each module has one job.",
    "When modifying architecture, explain the structural reasoning.",
    "Prefer composition over inheritance. Prefer data over abstraction.",
    "Keep interfaces clean \u2014 a good API is one you don't need docs for.",
  ],
  Synthesizer: [
    "Research before recommending \u2014 check existing patterns and prior art.",
    "Cross-reference multiple sources when making technical decisions.",
    "Gather full context before proposing solutions.",
    "Summarize trade-offs explicitly \u2014 never present one option as obvious.",
    "When uncertain, surface the uncertainty rather than guessing.",
  ],
  Healer: [
    "Fix root causes, not symptoms \u2014 trace the bug to its origin.",
    "Write clear error messages that tell the user what to do next.",
    "Document recovery paths for failure scenarios.",
    "When helping others, teach the principle \u2014 not just the fix.",
    "Prioritize stability and reliability over new features.",
  ],
  Creator: [
    "Bias toward action \u2014 try things rather than deliberating endlessly.",
    "Fast iteration over perfect planning \u2014 ship and refine.",
    "When prototyping, optimize for speed. When shipping, optimize for clarity.",
    "Novel approaches are welcome \u2014 don't default to 'how it's usually done'.",
    "Keep momentum \u2014 if blocked, try a different angle immediately.",
  ],
};

export const ARCHETYPE_SKILLS: Record<Archetype, SkillTemplate[]> = {
  Guardian: [
    {
      name: "validate",
      description: "Run validation checks before any destructive operation",
      content: `---
name: validate
description: Run validation checks before any destructive operation
---

Before executing any destructive operation (delete, overwrite, force-push, drop):
1. State what will be destroyed
2. Check if it's recoverable
3. Ask for explicit confirmation
4. Log what was done`,
    },
  ],
  Architect: [
    {
      name: "plan-first",
      description: "Outline implementation approach before writing code",
      content: `---
name: plan-first
description: Outline implementation approach before writing code
---

For non-trivial changes:
1. State the goal in one sentence
2. List files that will be touched
3. Describe the approach (not the code)
4. Identify risks or trade-offs
5. Wait for approval before implementing`,
    },
  ],
  Synthesizer: [
    {
      name: "research",
      description: "Gather context and existing patterns before recommending",
      content: `---
name: research
description: Gather context and existing patterns before recommending
---

Before making a recommendation:
1. Search the codebase for existing patterns
2. Check if this problem has been solved before
3. List 2-3 approaches with trade-offs
4. Recommend one with reasoning`,
    },
  ],
  Healer: [
    {
      name: "diagnose",
      description: "Trace errors to root cause before fixing",
      content: `---
name: diagnose
description: Trace errors to root cause before fixing
---

When encountering an error:
1. Read the full error message and stack trace
2. Identify the immediate cause vs root cause
3. Check if this error has occurred before (git log, issues)
4. Fix the root cause, not just the symptom
5. Add a test that would have caught this`,
    },
  ],
  Creator: [
    {
      name: "spike",
      description: "Quick prototype to validate an idea before full implementation",
      content: `---
name: spike
description: Quick prototype to validate an idea before full implementation
---

For exploratory work:
1. Time-box to 30 minutes
2. Minimal viable version \u2014 no error handling, no edge cases
3. Validate the core hypothesis
4. If it works: plan the real implementation
5. If it doesn't: document what was learned, move on`,
    },
  ],
};

export const ARCHETYPE_MEMORIES: Record<Archetype, MemoryTemplate[]> = {
  Guardian: [
    {
      name: "feedback_validation",
      description: "User prefers thorough validation before actions",
      type: "feedback",
      content: `---
name: feedback_validation
description: User prefers thorough validation before actions
type: feedback
---

Always validate before acting. Check assumptions, verify paths exist, confirm intent before destructive operations.

**Why:** User values correctness over speed. Mistakes cost more than caution.
**How to apply:** Before any write/delete/push, state what will happen and wait for confirmation.`,
    },
  ],
  Architect: [
    {
      name: "feedback_structure",
      description: "User values clean architecture and clear interfaces",
      type: "feedback",
      content: `---
name: feedback_structure
description: User values clean architecture and clear interfaces
type: feedback
---

Prefer structural solutions over patches. When fixing a bug, consider if the architecture invited it.

**Why:** User thinks in systems. A local fix that degrades the whole is worse than no fix.
**How to apply:** When proposing changes, explain how they fit the existing architecture. Flag when a fix works but hurts structure.`,
    },
  ],
  Synthesizer: [
    {
      name: "feedback_research",
      description: "User wants research and options before decisions",
      type: "feedback",
      content: `---
name: feedback_research
description: User wants research and options before decisions
type: feedback
---

Don't present a single recommendation without alternatives. Show the landscape first.

**Why:** User values informed decisions over fast ones. Context prevents regret.
**How to apply:** For technical decisions, present 2-3 options with trade-offs. Recommend one, but show your work.`,
    },
  ],
  Healer: [
    {
      name: "feedback_rootcause",
      description: "User wants root cause analysis, not quick patches",
      type: "feedback",
      content: `---
name: feedback_rootcause
description: User wants root cause analysis, not quick patches
type: feedback
---

When debugging, trace to origin. Don't stop at "this fixes it" \u2014 explain WHY it was broken.

**Why:** User learns from failures. A fix without understanding is a future regression.
**How to apply:** After identifying a fix, add one sentence explaining the root cause. If the fix is a band-aid, say so.`,
    },
  ],
  Creator: [
    {
      name: "feedback_action",
      description: "User prefers action and iteration over extensive planning",
      type: "feedback",
      content: `---
name: feedback_action
description: User prefers action and iteration over extensive planning
type: feedback
---

Bias toward doing. If unsure, try something small and fast rather than deliberating.

**Why:** User learns by building. Analysis paralysis is the enemy.
**How to apply:** For ambiguous requests, propose a quick experiment instead of asking 5 clarifying questions. Ship first, refine after.`,
    },
  ],
};
