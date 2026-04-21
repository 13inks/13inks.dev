import { Archetype, Option } from "./questions";

export interface ArchetypeScores {
  Guardian: number;
  Architect: number;
  Synthesizer: number;
  Healer: number;
  Creator: number;
}

export interface InkCell {
  point: Archetype;
  support: Archetype;
  specialist: Archetype;
}

export interface QuizResult {
  scores: ArchetypeScores;
  cell: InkCell;
  dominant: Archetype;
}

const ALL_ARCHETYPES: Archetype[] = [
  "Guardian",
  "Architect",
  "Synthesizer",
  "Healer",
  "Creator",
];

export function scoreAnswers(selectedOptions: Option[]): ArchetypeScores {
  const raw: ArchetypeScores = {
    Guardian: 0,
    Architect: 0,
    Synthesizer: 0,
    Healer: 0,
    Creator: 0,
  };

  for (const option of selectedOptions) {
    for (const [arch, weight] of Object.entries(option.weights)) {
      raw[arch as Archetype] += weight as number;
    }
  }

  // Normalize to sum = 1.0
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  if (total > 0) {
    for (const arch of ALL_ARCHETYPES) {
      raw[arch] = raw[arch] / total;
    }
  }

  return raw;
}

export function deriveInkCell(scores: ArchetypeScores): InkCell {
  const sorted = ALL_ARCHETYPES.slice().sort((a, b) => scores[b] - scores[a]);
  return {
    point: sorted[0],
    support: sorted[1],
    specialist: sorted[2],
  };
}

export function computeResult(selectedOptions: Option[]): QuizResult {
  const scores = scoreAnswers(selectedOptions);
  const cell = deriveInkCell(scores);
  return { scores, cell, dominant: cell.point };
}
