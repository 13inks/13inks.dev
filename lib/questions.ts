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
  textByContext?: Partial<Record<UseContext, string>>;
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

export function getOptionText(opt: Option, context: UseContext): string {
  return opt.textByContext?.[context] ?? opt.text;
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
        textByContext: {
          dev: "Trace through it systematically until I find the issue",
          research: "Walk through the reasoning step by step until I find the gap",
          creative: "Go back through what I've done and find where it shifted",
          personal: "Retrace my steps until I figure out where things went off",
          health: "Go through what changed recently, one thing at a time",
        },
        weights: { Guardian: 0.7, Architect: 0.2, Synthesizer: 0.1 },
      },
      {
        label: "B",
        text: "Understand why it happened, not just fix the symptom",
        textByContext: {
          dev: "Understand the root cause, not just fix the symptom",
          research: "Understand why the reasoning broke down, not just where",
          creative: "Sit with it until I understand what's actually not working",
          personal: "Figure out the real reason, not just smooth it over",
          health: "Understand what's actually causing it, not just treat the surface",
        },
        weights: { Architect: 0.7, Guardian: 0.2, Synthesizer: 0.1 },
      },
      {
        label: "C",
        text: "Look it up and see how others have handled it",
        textByContext: {
          dev: "Search for how others have solved similar problems",
          research: "Look at the literature and see how others have approached it",
          creative: "Look at how other people have handled something similar",
          personal: "Ask around or look up how other people have dealt with this",
          health: "Research it and see what others with similar experiences have found",
        },
        weights: { Synthesizer: 0.6, Healer: 0.2, Architect: 0.2 },
      },
      {
        label: "D",
        text: "Try something and adjust from there",
        textByContext: {
          dev: "Try a fix and iterate from there",
          research: "Rework the approach and see if the results improve",
          creative: "Try something different and see how it feels",
          personal: "Try something and see if it helps",
          health: "Make a small change and see how it goes",
        },
        weights: { Creator: 0.6, Healer: 0.2, Synthesizer: 0.2 },
      },
    ],
  },
  {
    id: 2,
    text: "How do you prefer to get up to speed on something new?",
    textByContext: {
      dev: "How do you prefer to get up to speed on a new codebase or tool?",
      research: "How do you prefer to get up to speed on a new topic or field?",
      creative: "How do you usually find your way into something new?",
      personal: "When you need to learn something new, how do you start?",
      health: "When you're trying to understand something about your health, where do you start?",
    },
    options: [
      {
        label: "A",
        text: "Read everything I can find before touching it",
        textByContext: {
          dev: "Read the docs and source before touching anything",
          research: "Read the key literature before forming any opinions",
          creative: "Immerse myself in existing work before starting my own",
          personal: "Read up on it thoroughly before doing anything",
          health: "Read as much as I can from reliable sources first",
        },
        weights: { Guardian: 0.5, Architect: 0.4, Synthesizer: 0.1 },
      },
      {
        label: "B",
        text: "Find good examples and learn by adapting them",
        textByContext: {
          dev: "Find good examples and learn by adapting them",
          research: "Find strong examples and model my approach on them",
          creative: "Find things I admire and learn by riffing on them",
          personal: "Find good examples and figure it out from there",
          health: "Find other people's experiences and learn from what worked for them",
        },
        weights: { Synthesizer: 0.5, Creator: 0.3, Architect: 0.2 },
      },
      {
        label: "C",
        text: "Talk to someone who already knows it well",
        textByContext: {
          dev: "Talk to someone who already knows the system",
          research: "Talk to someone who's worked in the area",
          creative: "Talk to someone whose work I respect",
          personal: "Ask someone I trust who's been through it",
          health: "Talk to someone who understands this — a professional or someone who's been there",
        },
        weights: { Healer: 0.6, Synthesizer: 0.3, Guardian: 0.1 },
      },
      {
        label: "D",
        text: "Start doing it and learn as I go",
        textByContext: {
          dev: "Start building and learn as I go",
          research: "Start writing and refine as I learn more",
          creative: "Start making something and figure it out along the way",
          personal: "Jump in and learn as I go",
          health: "Start trying things and pay attention to what helps",
        },
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
        textByContext: {
          dev: "Nothing slipped through — it holds up in production",
          research: "The methodology is airtight — it survives peer review",
          creative: "Every detail is intentional — nothing feels accidental",
          personal: "I thought it through properly and didn't miss anything important",
          health: "I covered all the bases and nothing got overlooked",
        },
        weights: { Guardian: 0.8, Architect: 0.2 },
      },
      {
        label: "B",
        text: "It's clear, well-organized, and makes sense to others",
        textByContext: {
          dev: "It's clean, well-structured, and makes sense to the next person",
          research: "The argument is clear, well-organized, and easy to follow",
          creative: "The vision is clear — someone else could see what I was going for",
          personal: "It makes sense and I could explain it to someone else",
          health: "I understand what happened and could explain it clearly",
        },
        weights: { Architect: 0.8, Guardian: 0.2 },
      },
      {
        label: "C",
        text: "It actually addresses what needed addressing",
        textByContext: {
          dev: "It solves the actual problem, not just the ticket",
          research: "It answers the question that actually matters",
          creative: "It says what I was actually trying to say",
          personal: "It actually helped with what I was dealing with",
          health: "It actually addressed what was going on, not just a symptom",
        },
        weights: { Synthesizer: 0.6, Architect: 0.2, Healer: 0.2 },
      },
      {
        label: "D",
        text: "There's something genuinely original in it",
        textByContext: {
          dev: "There's a genuinely clever solution in there",
          research: "There's a genuinely original insight in it",
          creative: "There's something in it that didn't exist before",
          personal: "I came away with a genuinely new perspective",
          health: "I learned something about myself I didn't know before",
        },
        weights: { Creator: 0.7, Architect: 0.2, Synthesizer: 0.1 },
      },
    ],
  },
  {
    id: 4,
    text: "When you're working on something with others, you naturally end up...",
    textByContext: {
      dev: "On a team project, you naturally end up...",
      research: "When collaborating on research, you naturally end up...",
      creative: "When you're creating something with other people, you end up...",
      personal: "When you're figuring something out with others, you end up...",
      health: "When you're working with someone on your health, you end up...",
    },
    options: [
      {
        label: "A",
        text: "Reviewing things carefully and catching what others missed",
        textByContext: {
          dev: "Reviewing PRs and catching edge cases others missed",
          research: "Fact-checking and catching gaps in the reasoning",
          creative: "Noticing what's not working and calling it out honestly",
          personal: "Spotting things others haven't thought of",
          health: "Making sure nothing important gets missed",
        },
        weights: { Guardian: 0.7, Healer: 0.2, Architect: 0.1 },
      },
      {
        label: "B",
        text: "Figuring out the overall shape and how it all fits together",
        textByContext: {
          dev: "Defining the architecture and how the pieces connect",
          research: "Structuring the argument and mapping how it all fits",
          creative: "Seeing the shape of the whole thing and where it's heading",
          personal: "Figuring out how everything connects and what to do next",
          health: "Putting the pieces together to see the bigger picture",
        },
        weights: { Architect: 0.7, Synthesizer: 0.2, Guardian: 0.1 },
      },
      {
        label: "C",
        text: "Making sure everyone has what they need and is on the same page",
        textByContext: {
          dev: "Making sure everyone has context and is unblocked",
          research: "Bringing different perspectives together and finding common ground",
          creative: "Making sure everyone feels heard and is pulling in the same direction",
          personal: "Making sure everyone's on the same page and feels good about it",
          health: "Making sure everyone involved understands what's happening",
        },
        weights: { Synthesizer: 0.6, Healer: 0.3, Architect: 0.1 },
      },
      {
        label: "D",
        text: "Taking on the parts that are interesting or haven't been done before",
        textByContext: {
          dev: "Taking on the parts that are technically interesting or unsolved",
          research: "Pursuing the angle no one else is exploring",
          creative: "Gravitating toward the part that excites me most",
          personal: "Taking on the part that feels most meaningful to me",
          health: "Focusing on the aspect I can actually do something about",
        },
        weights: { Creator: 0.7, Architect: 0.2, Synthesizer: 0.1 },
      },
    ],
  },
  {
    id: 5,
    text: "How much do you want your AI to do on its own?",
    textByContext: {
      dev: "How much autonomy do you want your AI to have over your code?",
      research: "How much do you want your AI to run with on its own?",
      creative: "How much freedom do you want to give your AI?",
      personal: "How much independence do you want your AI to have?",
      health: "How much do you want your AI to handle without checking in?",
    },
    options: [
      {
        label: "A",
        text: "Not much — I want to stay in the driver's seat",
        textByContext: {
          dev: "Minimal — I review every change before it lands",
          research: "Not much — I want to verify everything myself",
          creative: "Not much — I want to stay in the driver's seat",
          personal: "Not much — I like to stay in control",
          health: "Not much — I want to understand everything before acting on it",
        },
        weights: { Guardian: 0.7, Architect: 0.3 },
      },
      {
        label: "B",
        text: "Work through it together, but I sign off before anything happens",
        textByContext: {
          dev: "Work through it together, but I approve before any code ships",
          research: "Collaborate on the analysis, but I sign off on the conclusions",
          creative: "Bounce ideas together, but I make the final call",
          personal: "Think it through together, but I decide what to do",
          health: "Explore options together, but I decide what to try",
        },
        weights: { Architect: 0.5, Synthesizer: 0.3, Guardian: 0.2 },
      },
      {
        label: "C",
        text: "It can move ahead and I'll check in periodically",
        textByContext: {
          dev: "It can write code and I'll review periodically",
          research: "It can run with the analysis and I'll check key points",
          creative: "Let it explore and surprise me — I'll redirect if needed",
          personal: "Let it handle things and I'll check in when I want to",
          health: "It can track and suggest — I'll check in when it matters",
        },
        weights: { Healer: 0.4, Creator: 0.4, Synthesizer: 0.2 },
      },
      {
        label: "D",
        text: "As much as possible — I'll step in if something's off",
        textByContext: {
          dev: "As much as possible — I'll step in if the tests break",
          research: "As much as possible — I'll course-correct if it drifts",
          creative: "As much as possible — I trust the process",
          personal: "As much as possible — I'll step in if something feels off",
          health: "As much as possible — I'll flag anything that doesn't feel right",
        },
        weights: { Creator: 0.5, Synthesizer: 0.3, Healer: 0.2 },
      },
    ],
  },
  {
    id: 6,
    text: "When you look back on a project, what do you notice first?",
    textByContext: {
      dev: "When you look back on a codebase you've worked in, what do you notice first?",
      research: "When you look back on a finished piece of research, what do you notice first?",
      creative: "When you look back on a finished creative project, what do you notice first?",
      personal: "When you look back on a decision you made, what do you notice first?",
      health: "When you look back on how a health situation played out, what do you notice first?",
    },
    options: [
      {
        label: "A",
        text: "Whether the structure still holds — or where it started to drift",
        textByContext: {
          dev: "Whether the architecture still holds — or where it started to rot",
          research: "Whether the argument still stands up or has weakened",
          creative: "Whether the structure holds or started to wander",
          personal: "Whether my reasoning still makes sense in hindsight",
          health: "Whether what I tried is still working or has drifted",
        },
        weights: { Guardian: 0.5, Architect: 0.4, Synthesizer: 0.1 },
      },
      {
        label: "B",
        text: "The connections I made that weren't obvious at the start",
        textByContext: {
          dev: "The connections between systems I didn't see at first",
          research: "The threads I pulled together that weren't obvious at the start",
          creative: "The unexpected connections that emerged along the way",
          personal: "The dots I connected that I couldn't see at the time",
          health: "Patterns I didn't notice while it was happening",
        },
        weights: { Synthesizer: 0.5, Architect: 0.3, Creator: 0.2 },
      },
      {
        label: "C",
        text: "What I'd fix or simplify if I were doing it again",
        textByContext: {
          dev: "What I'd refactor or simplify if I were doing it again",
          research: "What I'd frame differently if I were starting over",
          creative: "What I'd do differently now that I've seen the whole thing",
          personal: "What I'd handle differently next time",
          health: "What I'd do differently if the same thing came up again",
        },
        weights: { Healer: 0.5, Architect: 0.3, Synthesizer: 0.2 },
      },
      {
        label: "D",
        text: "The moment it clicked into something real",
        textByContext: {
          dev: "The moment the solution clicked into place",
          research: "The breakthrough moment — when the thesis crystallized",
          creative: "The moment it came alive — when it became what it was meant to be",
          personal: "The moment it actually clicked and I knew what to do",
          health: "The moment something shifted and I started feeling different",
        },
        weights: { Creator: 0.6, Synthesizer: 0.2, Guardian: 0.2 },
      },
    ],
  },
  {
    id: 7,
    text: "Something important is about to be decided. What's your instinct?",
    textByContext: {
      dev: "A big architectural decision is about to be made. What's your instinct?",
      research: "You're about to commit to a key argument. What's your instinct?",
      creative: "A direction for your project is about to be locked in. What's your instinct?",
      personal: "A decision that affects your routine is about to be made. What's your instinct?",
      health: "A treatment or approach is about to be decided. What's your instinct?",
    },
    options: [
      {
        label: "A",
        text: "Make sure we've stress-tested it before we commit",
        textByContext: {
          dev: "Make sure we've stress-tested it before deploying",
          research: "Make sure the evidence holds up before publishing",
          creative: "Make sure it actually works before committing to it",
          personal: "Make sure I've really thought it through before deciding",
          health: "Make sure I understand the risks before committing",
        },
        weights: { Guardian: 0.6, Architect: 0.3, Synthesizer: 0.1 },
      },
      {
        label: "B",
        text: "Map the tradeoffs clearly so whoever decides has the full picture",
        textByContext: {
          dev: "Map the tradeoffs so the team can make an informed call",
          research: "Lay out the evidence on both sides clearly",
          creative: "Sketch out what each direction would look like",
          personal: "Think through what I'd gain and lose with each option",
          health: "Understand all the options and what each one means",
        },
        weights: { Architect: 0.5, Synthesizer: 0.4, Guardian: 0.1 },
      },
      {
        label: "C",
        text: "Trust the person who's been closest to the problem",
        textByContext: {
          dev: "Trust the engineer who's been closest to the problem",
          research: "Defer to whoever has the deepest expertise",
          creative: "Trust my gut — or the person whose instincts I respect most",
          personal: "Trust the person who knows the situation best",
          health: "Trust the person who knows my situation best",
        },
        weights: { Healer: 0.5, Synthesizer: 0.3, Guardian: 0.2 },
      },
      {
        label: "D",
        text: "Pick a direction and adjust — waiting costs more than being wrong",
        textByContext: {
          dev: "Ship it and iterate — waiting costs more than being wrong",
          research: "Commit to a position and refine it based on feedback",
          creative: "Pick a direction and see where it goes — I can always pivot",
          personal: "Just decide and adjust — overthinking makes it worse",
          health: "Try something and adjust based on how it goes",
        },
        weights: { Creator: 0.6, Architect: 0.2, Healer: 0.2 },
      },
    ],
  },
  {
    id: 8,
    text: "You're in the middle of something complex and a new piece of information arrives. What do you do?",
    textByContext: {
      dev: "You're deep in a problem and new information surfaces. What do you do?",
      research: "You're mid-analysis and a new source contradicts something. What do you do?",
      creative: "You're in the middle of something and a new idea hits. What do you do?",
      personal: "You're thinking something through and someone offers a different perspective. What do you do?",
      health: "You're tracking something and a new detail comes up that doesn't fit. What do you do?",
    },
    options: [
      {
        label: "A",
        text: "Check if it changes anything I thought was already settled",
        textByContext: {
          dev: "Check if it invalidates any assumptions in my current approach",
          research: "Check if it undermines anything I thought was established",
          creative: "See if it changes how I feel about what I've done so far",
          personal: "Check if it changes anything I already decided",
          health: "Check if it changes what I thought was going on",
        },
        weights: { Guardian: 0.5, Synthesizer: 0.4, Architect: 0.1 },
      },
      {
        label: "B",
        text: "Figure out where it fits in the bigger picture before acting on it",
        textByContext: {
          dev: "Figure out where it fits in the system before acting on it",
          research: "Place it in the broader context before drawing conclusions",
          creative: "See where it fits in the bigger picture before reacting",
          personal: "Think about how it connects to everything else first",
          health: "Try to understand how it fits with everything else I know",
        },
        weights: { Architect: 0.4, Synthesizer: 0.4, Guardian: 0.2 },
      },
      {
        label: "C",
        text: "Sit with it until I understand what it's really saying",
        textByContext: {
          dev: "Let it sink in before deciding what it means for the plan",
          research: "Sit with it until I understand what it's really telling me",
          creative: "Let it marinate — the meaning usually surfaces on its own",
          personal: "Sit with it for a bit before reacting",
          health: "Give it some time before jumping to conclusions",
        },
        weights: { Synthesizer: 0.5, Healer: 0.4, Architect: 0.1 },
      },
      {
        label: "D",
        text: "Fold it in and keep moving — I'll recalibrate as I go",
        textByContext: {
          dev: "Fold it in and keep shipping — I'll refactor if needed",
          research: "Incorporate it and keep writing — I'll revise in the next pass",
          creative: "Let it in and keep moving — it might take things somewhere new",
          personal: "Take it in and keep going — I'll adjust as needed",
          health: "Note it and keep going — I'll bring it up next time",
        },
        weights: { Creator: 0.6, Synthesizer: 0.2, Healer: 0.2 },
      },
    ],
  },
  {
    id: 9,
    text: "What does a really useful AI feel like to you?",
    textByContext: {
      dev: "What does a great AI coding partner feel like?",
      research: "What does a great AI research assistant feel like?",
      creative: "What does a great AI collaborator feel like?",
      personal: "What does a really helpful AI feel like to you?",
      health: "What does a really good AI health companion feel like?",
    },
    options: [
      {
        label: "A",
        text: "It remembers what I've done and keeps things consistent over time",
        textByContext: {
          dev: "It remembers my codebase and keeps things consistent",
          research: "It tracks what I've covered and avoids repeating itself",
          creative: "It remembers what I've made and builds on it",
          personal: "It remembers what I've told it and doesn't make me repeat myself",
          health: "It remembers my history and doesn't ask the same questions twice",
        },
        weights: { Guardian: 0.5, Synthesizer: 0.4, Architect: 0.1 },
      },
      {
        label: "B",
        text: "It anticipates where I'm going before I've said it out loud",
        textByContext: {
          dev: "It anticipates the next step before I've typed it",
          research: "It sees where my argument is heading and helps me get there",
          creative: "It picks up on the direction I'm going and runs with it",
          personal: "It gets what I'm trying to do without me spelling it out",
          health: "It connects the dots between things I mention at different times",
        },
        weights: { Architect: 0.4, Synthesizer: 0.4, Creator: 0.2 },
      },
      {
        label: "C",
        text: "It only surfaces things I'll actually care about",
        textByContext: {
          dev: "It only surfaces things relevant to what I'm working on right now",
          research: "It filters noise and only shows me what's actually relevant",
          creative: "It knows what inspires me and doesn't waste my time with the rest",
          personal: "It only brings up things I'll actually care about",
          health: "It only flags things that are actually worth paying attention to",
        },
        weights: { Synthesizer: 0.5, Guardian: 0.3, Healer: 0.2 },
      },
      {
        label: "D",
        text: "It helps me move fast without creating problems I have to clean up later",
        textByContext: {
          dev: "It ships fast without introducing regressions",
          research: "It helps me move quickly without cutting corners on rigor",
          creative: "It keeps the momentum going without getting in the way",
          personal: "It helps me get things done without creating new problems",
          health: "It helps me stay on track without overwhelming me",
        },
        weights: { Creator: 0.4, Healer: 0.4, Architect: 0.2 },
      },
    ],
  },
  {
    id: 10,
    text: "When you explain something to someone, what matters most to you?",
    textByContext: {
      dev: "When you explain a technical concept or decision to someone, what matters most?",
      research: "When you explain your findings or reasoning to someone, what matters most?",
      creative: "When you explain your creative choices to someone, what matters most?",
      personal: "When you explain your thinking to someone, what matters most?",
      health: "When you explain a health situation to someone, what matters most?",
    },
    options: [
      {
        label: "A",
        text: "That nothing important gets left out or glossed over",
        textByContext: {
          dev: "That the full picture is there — nothing critical gets left out",
          research: "That the evidence is complete — no important data gets omitted",
          creative: "That the full intention comes through — nothing important gets lost",
          personal: "That I don't leave out anything they'd want to know",
          health: "That nothing important gets left out or downplayed",
        },
        weights: { Guardian: 0.6, Architect: 0.2, Synthesizer: 0.2 },
      },
      {
        label: "B",
        text: "That the underlying structure is visible, not just the surface",
        textByContext: {
          dev: "That the architecture is clear, not just the API surface",
          research: "That the underlying logic is visible, not just the conclusion",
          creative: "That people can see the thinking behind it, not just the result",
          personal: "That they understand why, not just what",
          health: "That they understand the reasoning, not just the outcome",
        },
        weights: { Architect: 0.5, Synthesizer: 0.3, Healer: 0.2 },
      },
      {
        label: "C",
        text: "That it lands simply — the cleaner the better",
        textByContext: {
          dev: "That it's clear enough for someone new to act on",
          research: "That a non-expert could follow the core idea",
          creative: "That it lands simply — no jargon, no overthinking",
          personal: "That it makes sense without needing a long explanation",
          health: "That it's clear and simple — no medical jargon",
        },
        weights: { Healer: 0.5, Architect: 0.3, Creator: 0.2 },
      },
      {
        label: "D",
        text: "That it sparks something — I want them to see what I saw",
        textByContext: {
          dev: "That it clicks — they see the elegance of the solution",
          research: "That it sparks something — they leave thinking differently",
          creative: "That they feel something — they see what I saw",
          personal: "That it resonates — they actually get where I'm coming from",
          health: "That they really understand what it's been like",
        },
        weights: { Creator: 0.5, Synthesizer: 0.3, Guardian: 0.2 },
      },
    ],
  },
];
