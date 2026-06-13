// /seed/expand — Waitlist placeholder for the expand tier.
// No generation in v1. Just captures interest.

export default function ExpandPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Coming next</p>
      <h1 className="text-4xl font-bold tracking-tight mb-4">Grow your ecosystem.</h1>
      <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
        Memory files, rule constraints, agent scaffolds — and a living-garden tier
        that keeps your CLAUDE.md fresh as your codebase evolves. Notify me when it ships.
      </p>
      <form
        action="https://formspree.io/f/placeholder"
        method="POST"
        className="flex gap-2 max-w-sm mx-auto"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-600 text-zinc-200 placeholder:text-zinc-600"
        />
        <button
          type="submit"
          className="bg-amber-400 text-zinc-950 font-semibold px-5 py-2.5 rounded-xl hover:bg-amber-300 transition text-sm"
        >
          Notify me
        </button>
      </form>
      <p className="text-xs text-zinc-600 mt-4">No spam. One email when it ships.</p>
    </div>
  );
}
