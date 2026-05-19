import { Archetype } from "./questions";
import { InkCell } from "./scoring";
import {
  ARCHETYPE_RULES,
} from "./templates";
import { ARCHETYPES } from "./archetypes";

export interface GeneratedSeed {
  claudeMd: string;
  skills: { path: string; content: string }[];
  plantMd: string;
}

// Anchor skill pack — shared across all archetypes.
// Two skills per packet, selected by dominant archetype.
const ANCHOR_SKILLS: Record<string, string> = {
  scope: `<!--
  This is a scaffold template, not a finished skill.
  Plant this file at .claude/skills/scope.md in your project, then ask
  your Claude session to adapt it to how you actually work.
-->
---
name: scope
description: Declare scope for the current task before any editing begins. Forces an explicit goal/files-in/files-out/done-when contract that prevents drift.
---

# /scope — Declare what we are doing

When invoked, do exactly this:

1. Restate the user's request in one sentence — your understanding of the goal.
2. List **files in scope**: every file you intend to read or modify.
3. List **files explicitly out of scope**: anything you might be tempted to touch but won't.
4. State **done when**: the observable signal that the task is complete.
5. Write the four items above to \`.anchor/scope.md\`. Overwrite any prior scope.
6. **Stop and wait for confirmation** before doing any edits.

If the work grows past declared scope mid-task, stop and re-run /scope.`,

  checkpoint: `<!--
  This is a scaffold template, not a finished skill.
  Plant this file at .claude/skills/checkpoint.md in your project, then ask
  your Claude session to adapt it to how you actually work.
-->
---
name: checkpoint
description: Read back current understanding of the task and recent work. Use mid-task to catch drift before it compounds.
---

# /checkpoint — Read back where we are

When invoked, write **one paragraph** (3-5 sentences) covering:

1. What we are trying to accomplish.
2. What you have done so far.
3. What you believe the current state is.
4. What you think the next step is.

Then **stop**. Do not edit. Do not propose. Wait for the user to confirm or correct.`,

  "touch-check": `<!--
  This is a scaffold template, not a finished skill.
  Plant this file at .claude/skills/touch-check.md in your project, then ask
  your Claude session to adapt it to how you actually work.
-->
---
name: touch-check
description: Before any multi-file edit, list every file about to be modified and wait for explicit approval.
---

# /touch-check — List the files, wait for the green light

When invoked:

1. List every file you are about to **create, modify, or delete**. One file per line.
2. For each file, write a half-sentence stating *what* you intend to change.
3. Cross-reference against \`.anchor/scope.md\` if it exists. Flag anything out of scope.
4. **Stop**. Do not edit anything until the user approves.`,

  grounded: `<!--
  This is a scaffold template, not a finished skill.
  Plant this file at .claude/skills/grounded.md in your project, then ask
  your Claude session to adapt it to how you actually work.
-->
---
name: grounded
description: Force re-reading every file the next claim or edit depends on. Use when you catch yourself about to assert something from memory.
---

# /grounded — Re-read before claiming

When invoked:

1. Identify every file your next statement or edit depends on.
2. **Read every one of them** using the Read tool. Memory does not count.
3. Restate your claim grounded in what you just saw.
4. If what you saw contradicts your earlier claim, say so plainly.`,

  handoff: `<!--
  This is a scaffold template, not a finished skill.
  Plant this file at .claude/skills/handoff.md in your project, then ask
  your Claude session to adapt it to how you actually work.
-->
---
name: handoff
description: Write the end-of-session summary so the next session can resume cleanly.
---

# /handoff — Write the resume note

When invoked, write a one-paragraph summary to \`.anchor/handoff.md\`:

1. **Shipped** — what we finished and verified this session.
2. **In progress** — what is partially done, and where the seam is.
3. **Blocked** — anything needing the user's input before it can move.
4. **Next step** — the single most useful thing to do when we resume.

4-6 sentences. Date-stamp the top. Append, do not overwrite.`,
};

// Two starter skills per dominant archetype (Anchor pack selection).
const ARCHETYPE_STARTER_SKILLS: Record<Archetype, [string, string]> = {
  Architect: ["scope", "checkpoint"],
  Synthesizer: ["grounded", "scope"],
  Creator: ["scope", "touch-check"],
  Guardian: ["touch-check", "grounded"],
  Healer: ["checkpoint", "handoff"],
};

const PLANT_MD = `# Plant your seed packet

You just downloaded a starter packet for your Claude Code setup. These files are
**templates for your Claude to personalize**, not finished artifacts. Here's how
to use them.

## Plant in 3 steps

1. **Move this directory into your project root.** The packet should sit at
   \`<your-project>/13inks-seed-packet/\`.

2. **Open Claude Code in your project root.** Run \`claude\` from that directory,
   so Claude has access to your real codebase.

3. **Paste this prompt:**

   > I just downloaded a seed packet from 13inks. The files are in
   > ./13inks-seed-packet/. Read each one, look at my actual project, and
   > propose where each file goes (CLAUDE.md to root, skills to .claude/skills/,
   > etc.) and what changes are needed to match my real context. Ask me about
   > anything you can't infer. Don't write anything yet — show me the plan first.

4. Review the plan, approve, let Claude land the files.

That's it. Your ecosystem is planted. Come back to 13inks for the expand layer
when you're ready to grow further.
`;

export function generateSeed(cell: InkCell): GeneratedSeed {
  const claudeMd = generateClaudeMd(cell);
  const skills = generateSkillsV2(cell.point);
  return { claudeMd, skills, plantMd: PLANT_MD };
}

function generateClaudeMd(cell: InkCell): string {
  const pointInfo = ARCHETYPES[cell.point];
  const supportInfo = ARCHETYPES[cell.support];
  const specialistInfo = ARCHETYPES[cell.specialist];

  // Point gets all rules, support gets top 2, specialist gets top 1
  const pointRules = ARCHETYPE_RULES[cell.point];
  const supportRules = ARCHETYPE_RULES[cell.support].slice(0, 2);
  const specialistRules = ARCHETYPE_RULES[cell.specialist].slice(0, 1);

  const allRules = [...pointRules, ...supportRules, ...specialistRules];

  return `<!--
  This is a scaffold template, not a finished CLAUDE.md.
  Plant this file at the root of your project, then ask your Claude session
  to personalize it against your real codebase and workflow.
-->

## AIO Recommendations
### Your Inks
- **Point (${pointInfo.name}):** ${pointInfo.aiStyle}
- **Support (${supportInfo.name}):** ${supportInfo.aiStyle}
- **Specialist (${specialistInfo.name}):** ${specialistInfo.aiStyle}

### Rules
${allRules.map((r) => `- ${r}`).join("\n")}
`;
}

// v2: 2 Anchor skills selected by dominant archetype, no memories in v1 packet.
function generateSkillsV2(dominant: Archetype): { path: string; content: string }[] {
  const [skill1, skill2] = ARCHETYPE_STARTER_SKILLS[dominant];
  return [
    { path: `skills/${skill1}.md`, content: ANCHOR_SKILLS[skill1] },
    { path: `skills/${skill2}.md`, content: ANCHOR_SKILLS[skill2] },
  ];
}
