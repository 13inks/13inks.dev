export type Archetype = "Guardian" | "Architect" | "Synthesizer" | "Healer" | "Creator";

export type UseContext =
  | "dev"
  | "research"
  | "creative"
  | "personal"
  | "health";

export interface Option {
  label: string;
  text: string;
  weights: Partial<Record<Archetype, number>>;
}

export interface Question {
  id: number;
  text: string;
  // Rail-specific overrides — if context matches, use this text instead.
  textByContext?: Partial<Record<UseContext, string>>;
  options: Option[];
}

export function getQuestionText(q: Question, context: UseContext): string {
  return q.textByContext?.[context] ?? q.text;
}

// Question 0 — use context (handled separately in the quiz UI, not scored)
export const USE_CONTEXT_OPTIONS: { value: UseContext; label: string; description: string }[] = [
  {
    value: "dev",
    label: "Building software",
    description: "Writing code, shipping products, technical work",
  },
  {
    value: "research",
    label: "Research or writing",
    description: "Papers, essays, analysis, making sense of complex topics",
  },
  {
    value: "creative",
    label: "Creative work",
    description: "Fiction, screenwriting, design, music, any kind of making",
  },
  {
    value: "personal",
    label: "Day-to-day life",
    description: "Thinking things through, staying organized, getting answers",
  },
  {
    value: "health",
    label: "Health and wellness",
    description: "Understanding symptoms, tracking how you feel, asking better questions",
  },
];

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Something isn't working the way you expected. What do you do first?",
    textByContext: {
      dev: "Something breaks in your workflow. What do you do first?",
      research: "Your argument isn't holding together. What do you do first?",
      creative: "Something about your project feels off. What do you do first?",
      personal: "Something in your day isn't going the way you expected. What do you do first?",
      health: "A symptom or feeling isn't making sense to you. What do you do first?",
    },
    options: [
      {
        label: "A",
        text: "Go through it step by step until I find it",
        weights: { Guardian: 0.7, Architect: 0.2, Synthesizer: 0.1 },
      },
      {
        label: "B",
        text: "Understand why it happened, not just fix the symptom",
        weights: { Architect: 0.7, Guardian: 0.2, Synthesizer: 0.1 },
      },
      {
        label: "C",
        text: "Look it up and see how others have handled it",
        weights: { Synthesizer: 0.6, Healer: 0.2, Architect: 0.2 },
      },
      {
        label: "D",
        text: "Try something and adjust from there",
        weights: { Creator: 0.6, Healer: 0.2, Synthesizer: 0.2 },
      },
    ],
  },
  {
    id: 2,
    text: "How do you prefer to get up to speed on something new?",
    options: [
      {
        label: "A",
        text: "Read everything I can find before touching it",
        weights: { Guardian: 0.5, Architect: 0.4, Synthesizer: 0.1 },
      },
      {
        label: "B",
        text: "Find good examples and learn by adapting them",
        weights: { Synthesizer: 0.5, Creator: 0.3, Architect: 0.2 },
      },
      {
        label: "C",
        text: "Talk to someone who already knows it well",
        weights: { Healer: 0.6, Synthesizer: 0.3, Guardian: 0.1 },
      },
      {
        label: "D",
        text: "Start doing it and learn as I go",
        weights: { Creator: 0.6, Architect: 0.2, Healer: 0.2 },
      },
    ],
  },
  {
    id: 3,
    text: "When something you've worked on is finished, what matters most?",
    textByContext: {
      dev: "When your work ships, what matters most?",
      research: "When your paper or analysis is done, what matters most?",
      creative: "When you finish a piece, what matters most?",
      personal: "When you've worked through something, what matters most?",
      health: "When you've tracked something for a while, what matters most?",
    },
    options: [
      {
        label: "A",
        text: "Nothing slipped through — it holds up under scrutiny",
        weights: { Guardian: 0.8, Architect: 0.2 },
      },
      {
        label: "B",
        text: "It's clear, well-organized, and makes sense to others",
        weights: { Architect: 0.8, Guardian: 0.2 },
      },
      {
        label: "C",
        text: "It actually addresses what needed addressing",
        weights: { Synthesizer: 0.6, Architect: 0.2, Healer: 0.2 },
      },
      {
        label: "D",
        text: "There's something genuinely original in it",
        weights: { Creator: 0.7, Architect: 0.2, Synthesizer: 0.1 },
      },
    ],
  },
  {
    id: 4,
    text: "When you're working on something with others, you naturally end up...",
    options: [
      {
        label: "A",
        text: "Reviewing things carefully and catching what others missed",
        weights: { Guardian: 0.7, Healer: 0.2, Architect: 0.1 },
      },
      {
        label: "B",
        text: "Figuring out the overall shape and how it all fits together",
        weights: { Architect: 0.7, Synthesizer: 0.2, Guardian: 0.1 },
      },
      {
        label: "C",
        text: "Making sure everyone has what they need and is on the same page",
        weights: { Synthesizer: 0.6, Healer: 0.3, Architect: 0.1 },
      },
      {
        label: "D",
        text: "Taking on the parts that are interesting or haven't been done before",
        weights: { Creator: 0.7, Architect: 0.2, Synthesizer: 0.1 },
      },
    ],
  },
  {
    id: 5,
    text: "How much do you want your AI to do on its own?",
    options: [
      {
        label: "A",
        text: "Not much — I want to stay in the driver's seat",
        weights: { Guardian: 0.7, Architect: 0.3 },
      },
      {
        label: "B",
        text: "Work through it together, but I sign off before anything happens",
        weights: { Architect: 0.5, Synthesizer: 0.3, Guardian: 0.2 },
      },
      {
        label: "C",
        text: "It can move ahead and I'll check in periodically",
        weights: { Healer: 0.4, Creator: 0.4, Synthesizer: 0.2 },
      },
      {
        label: "D",
        text: "As much as possible — I'll step in if something's off",
        weights: { Creator: 0.5, Synthesizer: 0.3, Healer: 0.2 },
      },
    ],
  },
];
