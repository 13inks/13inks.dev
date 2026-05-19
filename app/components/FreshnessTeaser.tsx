"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PLACEHOLDER = `# Project rules
- 940 tests passing as of April 2025
- 16 crates, deploy via cargo build --release
- Use Tailwind 3 (we'll migrate to 4 next quarter)`;

export default function FreshnessTeaser() {
  const router = useRouter();
  const [text, setText] = useState("");

  function handleCheck() {
    if (!text.trim()) return;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("landing_prefill", text);
    }
    router.push("/freshness");
  }

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={8}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-zinc-600 resize-y"
      />
      <div className="flex items-center justify-between">
        <button
          onClick={handleCheck}
          disabled={!text.trim()}
          className="bg-amber-400 text-zinc-950 font-semibold px-6 py-2.5 rounded-lg hover:bg-amber-300 disabled:opacity-40 transition"
        >
          Check
        </button>
        <span className="text-xs text-zinc-500">
          Two free a week. No signup.
        </span>
      </div>
    </div>
  );
}
