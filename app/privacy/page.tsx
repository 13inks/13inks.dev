// Privacy — specific, code-anchored disclosure.
// Every claim on this page is grounded in a real file path.
// If the code and this page disagree, the code wins and this page is wrong.

export const metadata = {
  title: "Privacy — 13inks Freshness",
  description:
    "What we store, what we don't, and where to verify it in the code.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-zinc-300">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3 text-zinc-100">
          We see drift, not docs.
        </h1>
        <p className="text-lg text-zinc-400">
          Specific commitments, anchored to the code. Not legalese.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          What we never store
        </h2>
        <ul className="space-y-4">
          <li>
            <span className="text-zinc-100 font-medium">
              Your CLAUDE.md text.
            </span>{" "}
            <span className="text-zinc-400">
              The file you paste is analyzed in memory, the score is returned,
              and the request scope is discarded. We never write the body to
              disk and we never log it.
            </span>
            <div className="mt-1 text-xs text-zinc-500">
              Verify:{" "}
              <code className="text-amber-400/90 font-mono">
                app/api/check-freshness/route.ts
              </code>
            </div>
          </li>
          <li>
            <span className="text-zinc-100 font-medium">Your identity.</span>{" "}
            <span className="text-zinc-400">
              No accounts for free checks. No email. No IP collected. The
              browser generates a random UUID; we salt-and-hash it before
              storage so the on-disk value is non-reversible.
            </span>
            <div className="mt-1 text-xs text-zinc-500">
              Verify:{" "}
              <code className="text-amber-400/90 font-mono">
                lib/freshness/quota.ts
              </code>
            </div>
          </li>
          <li>
            <span className="text-zinc-100 font-medium">
              Sentences from your file.
            </span>{" "}
            <span className="text-zinc-400">
              Flagged claims appear on your result page from in-memory analysis.
              The flagged sentences are returned to your browser and not
              persisted on our side.
            </span>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          What we do store
        </h2>
        <p className="text-zinc-400 mb-4">
          We persist anonymized signal so the scorer learns which kinds of
          claims drift fastest. None of it is your raw text.
        </p>
        <ul className="space-y-4">
          <li>
            <span className="text-zinc-100 font-medium">Quota ledger.</span>{" "}
            <span className="text-zinc-400">
              A salted hash of your fingerprint plus a timestamp. Used only to
              enforce the two-free-checks-per-rolling-week limit.
            </span>
          </li>
          <li>
            <span className="text-zinc-100 font-medium">Claim signals.</span>{" "}
            <span className="text-zinc-400">
              For each check, one record per detected claim:{" "}
              <code className="font-mono text-sm text-zinc-300">
                {"{ type, context, value, staleScore }"}
              </code>
              . Example: <em>&quot;a count of 50 tests, drift score 60.&quot;</em>{" "}
              Short keywords, counts, and version numbers — not full sentences.
            </span>
            <div className="mt-1 text-xs text-zinc-500">
              Verify:{" "}
              <code className="text-amber-400/90 font-mono">
                lib/freshness/store.ts
              </code>
            </div>
          </li>
          <li>
            <span className="text-zinc-100 font-medium">
              Stripe payment records.
            </span>{" "}
            <span className="text-zinc-400">
              If you pay, Stripe processes the card. We receive a session ID
              and a single-use redemption token. We never see your card.
            </span>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          What changes if you subscribe
        </h2>
        <p className="text-zinc-400">
          Subscribing requires a magic-link email so we can send your monthly
          drift report. That email is associated with your subscription and
          with drift trends across the files you&apos;ve checked. You can delete
          the association at any time — see{" "}
          <em>Removing your data</em> below.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          Where to verify this
        </h2>
        <p className="text-zinc-400 mb-4">
          Every claim above is grounded in a real file:
        </p>
        <ul className="space-y-2 text-sm">
          <li>
            <code className="text-amber-400/90 font-mono">
              app/api/check-freshness/route.ts
            </code>
            <span className="text-zinc-500"> — </span>
            <span className="text-zinc-400">
              the request handler. The text body is passed to{" "}
              <code className="font-mono">analyze()</code> in memory and is
              never written or logged.
            </span>
          </li>
          <li>
            <code className="text-amber-400/90 font-mono">
              lib/freshness/quota.ts
            </code>
            <span className="text-zinc-500"> — </span>
            <span className="text-zinc-400">
              fingerprint salt-and-hash; append-only ledger of usage.
            </span>
          </li>
          <li>
            <code className="text-amber-400/90 font-mono">
              lib/freshness/store.ts
            </code>
            <span className="text-zinc-500"> — </span>
            <span className="text-zinc-400">
              the pattern store. The persisted shape is{" "}
              <code className="font-mono">PatternRecord</code> only.
            </span>
          </li>
          <li>
            <code className="text-amber-400/90 font-mono">
              lib/freshness/analyzer.ts
            </code>
            <span className="text-zinc-500"> — </span>
            <span className="text-zinc-400">
              pure function. No side effects. No network.
            </span>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          Removing your data
        </h2>
        <p className="text-zinc-400">
          For free use, there&apos;s nothing tied to you — we don&apos;t know who
          you are. To clear your local fingerprint, delete{" "}
          <code className="text-amber-400/90 font-mono text-sm">
            freshness_fp
          </code>{" "}
          from your browser&apos;s local storage for this site. Subscribers can
          email{" "}
          <a
            href="mailto:privacy@13inks.dev"
            className="text-amber-400 underline hover:text-amber-300"
          >
            privacy@13inks.dev
          </a>{" "}
          for full deletion.
        </p>
      </section>

      <footer className="mt-16 pt-8 border-t border-zinc-900 text-xs text-zinc-600">
        <p>
          Anchored to the code as of the latest deploy. If you find a
          discrepancy between this page and what the code does, the code wins
          and we&apos;ll update this page.
        </p>
      </footer>
    </div>
  );
}
