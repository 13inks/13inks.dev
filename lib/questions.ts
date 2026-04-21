export type Archetype = "Guardian" | "Architect" | "Synthesizer" | "Healer" | "Creator";

export interface Option {
  label: string;
  text: string;
  weights: Partial<Record<Archetype, number>>;
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "When something breaks in your workflow, what do you do first?",
    options: [
      {
        label: "A",
        text: "Check logs and verify systematically",
        weights: { Guardian: 0.7, Architect: 0.2, Synthesizer: 0.1 },
      },
      {
        label: "B",
        text: "Understand the root cause architecture",
        weights: { Architect: 0.7, Guardian: 0.2, Synthesizer: 0.1 },
      },
      {
        label: "C",
        text: "Research what others have done",
        weights: { Synthesizer: 0.6, Healer: 0.2, Architect: 0.2 },
      },
      {
        label: "D",
        text: "Try a quick fix and iterate",
        weights: { Creator: 0.6, Healer: 0.2, Synthesizer: 0.2 },
      },
    ],
  },
  {
    id: 2,
    text: "How do you prefer to learn a new tool?",
    options: [
      {
        label: "A",
        text: "Read the docs thoroughly first",
        weights: { Guardian: 0.5, Architect: 0.4, Synthesizer: 0.1 },
      },
      {
        label: "B",
        text: "Look at examples and adapt them",
        weights: { Synthesizer: 0.5, Creator: 0.3, Architect: 0.2 },
      },
      {
        label: "C",
        text: "Ask someone who already knows it",
        weights: { Healer: 0.6, Synthesizer: 0.3, Guardian: 0.1 },
      },
      {
        label: "D",
        text: "Jump in and figure it out",
        weights: { Creator: 0.6, Architect: 0.2, Healer: 0.2 },
      },
    ],
  },
  {
    id: 3,
    text: "What matters most when your work ships?",
    options: [
      {
        label: "A",
        text: "It follows all rules and passes every check",
        weights: { Guardian: 0.8, Architect: 0.2 },
      },
      {
        label: "B",
        text: "The architecture is clean and maintainable",
        weights: { Architect: 0.8, Guardian: 0.2 },
      },
      {
        label: "C",
        text: "It solves the right problem",
        weights: { Synthesizer: 0.6, Architect: 0.2, Healer: 0.2 },
      },
      {
        label: "D",
        text: "It's novel or elegant",
        weights: { Creator: 0.7, Architect: 0.2, Synthesizer: 0.1 },
      },
    ],
  },
  {
    id: 4,
    text: "When working on a team project, you naturally gravitate toward...",
    options: [
      {
        label: "A",
        text: "Reviewing work and catching issues",
        weights: { Guardian: 0.7, Healer: 0.2, Architect: 0.1 },
      },
      {
        label: "B",
        text: "Designing overall structure",
        weights: { Architect: 0.7, Synthesizer: 0.2, Guardian: 0.1 },
      },
      {
        label: "C",
        text: "Gathering context and requirements",
        weights: { Synthesizer: 0.6, Healer: 0.3, Architect: 0.1 },
      },
      {
        label: "D",
        text: "Building the interesting or novel parts",
        weights: { Creator: 0.7, Architect: 0.2, Synthesizer: 0.1 },
      },
    ],
  },
  {
    id: 5,
    text: "How much should your AI assistant do autonomously?",
    options: [
      {
        label: "A",
        text: "Minimal \u2014 I want full control",
        weights: { Guardian: 0.7, Architect: 0.3 },
      },
      {
        label: "B",
        text: "Moderate \u2014 plan together, I approve",
        weights: { Architect: 0.5, Synthesizer: 0.3, Guardian: 0.2 },
      },
      {
        label: "C",
        text: "Significant \u2014 suggest and do, I review after",
        weights: { Healer: 0.4, Creator: 0.4, Synthesizer: 0.2 },
      },
      {
        label: "D",
        text: "Maximum \u2014 just get it done",
        weights: { Creator: 0.5, Synthesizer: 0.3, Healer: 0.2 },
      },
    ],
  },
];
