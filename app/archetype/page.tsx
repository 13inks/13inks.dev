"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, USE_CONTEXT_OPTIONS, getQuestionText, Option, UseContext } from "@/lib/questions";
import { computeResult, ArchetypeScores } from "@/lib/scoring";
import { ARCHETYPES } from "@/lib/archetypes";

export default function ArchetypePage() {
  const router = useRouter();
  const [context, setContext] = useState<UseContext | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Option[]>([]);
  const [runningScores, setRunningScores] = useState<ArchetypeScores>({
    Guardian: 0,
    Architect: 0,
    Synthesizer: 0,
    Healer: 0,
    Creator: 0,
  });

  const totalSteps = QUESTIONS.length + 1; // +1 for context question
  const progress = context === null ? 0 : ((currentQ + 1) / totalSteps) * 100;

  function handleContextSelect(c: UseContext) {
    setContext(c);
  }

  function handleSelect(option: Option) {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);

    const newScores = { ...runningScores };
    for (const [arch, weight] of Object.entries(option.weights)) {
      newScores[arch as keyof ArchetypeScores] += weight as number;
    }
    setRunningScores(newScores);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const result = computeResult(newAnswers);
      const params = new URLSearchParams({
        d: result.dominant,
        s: JSON.stringify(result.scores),
        p: result.cell.point,
        su: result.cell.support,
        sp: result.cell.specialist,
        ctx: context ?? "dev",
      });
      router.push(`/archetype/results?${params.toString()}`);
    }
  }

  const maxScore = Math.max(...Object.values(runningScores), 0.01);

  // Step 0: use context question
  if (context === null) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 transition-all duration-500 ease-out" style={{ width: "0%" }} />
          </div>
          <p className="text-xs text-zinc-500 mt-2">1 of {totalSteps}</p>
        </div>

        <h2 className="text-2xl font-bold mb-3">What do you mostly use Claude for?</h2>
        <p className="text-sm text-zinc-500 mb-8">This shapes your experience. Pick the closest fit.</p>

        <div className="flex flex-col gap-3">
          {USE_CONTEXT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleContextSelect(opt.value)}
              className="text-left border border-zinc-800 rounded-lg px-6 py-4 hover:border-amber-400/50 hover:bg-zinc-900 transition cursor-pointer"
            >
              <p className="font-medium text-zinc-100 mb-0.5">{opt.label}</p>
              <p className="text-sm text-zinc-500">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Steps 1-5: archetype questions
  const question = QUESTIONS[currentQ];
  const questionText = getQuestionText(question, context);

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-12">
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          {currentQ + 2} of {totalSteps}
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-8">{questionText}</h2>

      <div className="flex flex-col gap-3 mb-12">
        {question.options.map((option) => (
          <button
            key={option.label}
            onClick={() => handleSelect(option)}
            className="text-left border border-zinc-800 rounded-lg px-6 py-4 hover:border-amber-400/50 hover:bg-zinc-900 transition cursor-pointer"
          >
            <span className="text-zinc-400 font-mono mr-3">{option.label}</span>
            <span>{option.text}</span>
          </button>
        ))}
      </div>

      {currentQ > 0 && (
        <div className="border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-500 mb-3">Your pattern is forming...</p>
          <div className="flex flex-col gap-1.5">
            {Object.entries(runningScores)
              .sort(([, a], [, b]) => b - a)
              .map(([arch, score]) => (
                <div key={arch} className="flex items-center gap-3">
                  <span
                    className="text-xs w-24 text-right"
                    style={{ color: ARCHETYPES[arch as keyof typeof ARCHETYPES].color }}
                  >
                    {arch}
                  </span>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(score / maxScore) * 100}%`,
                        backgroundColor: ARCHETYPES[arch as keyof typeof ARCHETYPES].color,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
