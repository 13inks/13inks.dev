// Doc Refresh — landing + analysis flow.
// Anonymous diagnosis (2 free per rolling 7-day window per fingerprint),
// paid one-time refresh ($1) returns the rewrites layer. Tone per spec §7:
// subtly sigma — declarative, no emojis, no exclamation theater.

"use client";

import { useEffect, useState } from "react";

const FP_KEY = "freshness_fp";
const PENDING_KEY = "freshness_pending_text";

interface Claim {
  type: string;
  text: string;
  value: string;
  line: number;
  staleScore: number;
  reason: string;
}

interface Report {
  overallScore: number;
  claims: Claim[];
  summary: { total: number; high: number; medium: number; low: number };
  suggestions?: string[]; // present only on paid tier
  tier: "free" | "paid";
  quota?: { used: number; remaining: number; resetAt: string };
}

interface QuotaError {
  error: "quota_exhausted";
  message: string;
  quota: { used: number; remaining: number; resetAt: string };
  options: {
    single_check: { price_cents: number; label: string };
    subscribe: { price_cents: number; label: string };
  };
}

function getFingerprint(): string {
  if (typeof window === "undefined") return "";
  let fp = window.localStorage.getItem(FP_KEY);
  if (!fp) {
    fp =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.localStorage.setItem(FP_KEY, fp);
  }
  return fp;
}

const PLACEHOLDER = `# Project rules
- 940 tests passing as of April 2025
- 16 crates, deploy via cargo build --release
- Use Tailwind 3 (we'll migrate to 4 next quarter)`;

export default function FreshnessPage() {
  const [text, setText] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [quotaError, setQuotaError] = useState<QuotaError | null>(null);
  const [loading, setLoading] = useState(false);
  const [genericError, setGenericError] = useState<string | null>(null);
  const [fp, setFp] = useState("");

  useEffect(() => {
    setFp(getFingerprint());
    redeemFromUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function redeemFromUrl() {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;

    // Strip the session_id from the URL bar so a refresh doesn't retry.
    window.history.replaceState({}, "", "/freshness");

    const pendingText = window.localStorage.getItem(PENDING_KEY) || "";

    setLoading(true);
    try {
      const r = await fetch("/api/checkout/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!r.ok) {
        setGenericError("Payment didn't validate. Try again.");
        return;
      }
      const { token } = (await r.json()) as { token: string };

      if (!pendingText) {
        setGenericError(
          "Payment cleared. Paste the file again — we don't hold onto it.",
        );
        return;
      }

      const c = await fetch("/api/check-freshness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: pendingText,
          paid: true,
          paid_token: token,
        }),
      });
      if (!c.ok) {
        setGenericError("Analyzer didn't respond. Try again.");
        return;
      }
      const data = (await c.json()) as Report;
      setText(pendingText);
      setReport(data);
      window.localStorage.removeItem(PENDING_KEY);
    } catch {
      setGenericError("Something went wrong validating your payment.");
    } finally {
      setLoading(false);
    }
  }

  async function check() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setReport(null);
    setQuotaError(null);
    setGenericError(null);

    try {
      const res = await fetch("/api/check-freshness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, fingerprint: fp }),
      });

      if (res.status === 402) {
        const data = (await res.json()) as QuotaError;
        setQuotaError(data);
        return;
      }

      if (!res.ok) {
        setGenericError("Analyzer didn't respond. Try again.");
        return;
      }

      const data = (await res.json()) as Report;
      setReport(data);
    } catch {
      setGenericError("Analyzer didn't respond. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function startCheckout(mode: "single" | "bundle" | "sub") {
    if (typeof window === "undefined") return;
    if (mode !== "sub" && text.trim()) {
      window.localStorage.setItem(PENDING_KEY, text);
    }
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, fingerprint: fp }),
      });
      if (!r.ok) {
        setGenericError("Checkout didn't open. Try again.");
        return;
      }
      const { url } = (await r.json()) as { url: string };
      window.location.href = url;
    } catch {
      setGenericError("Checkout didn't open. Try again.");
    }
  }

  function reset() {
    setReport(null);
    setQuotaError(null);
    setGenericError(null);
    setText("");
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Your CLAUDE.md was written for code that&apos;s moved on.
        </h1>
        <p className="text-lg text-zinc-400">
          Paste it. Get a freshness score. Two free checks a week.
        </p>
      </header>

      {!report && !quotaError && (
        <div className="space-y-3 mb-10">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={12}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-zinc-600 resize-y"
          />
          <div className="flex items-center justify-between">
            <button
              onClick={check}
              disabled={loading || !text.trim()}
              className="bg-amber-400 text-zinc-950 font-semibold px-6 py-2.5 rounded-lg hover:bg-amber-300 disabled:opacity-40 transition"
            >
              {loading ? "Reading…" : "Check"}
            </button>
            <p className="text-xs text-zinc-500">
              {text.length > 0 ? `${text.length.toLocaleString()} chars` : ""}
            </p>
          </div>
        </div>
      )}

      {genericError && (
        <div className="mb-10 p-4 border border-zinc-800 rounded-lg text-zinc-400">
          {genericError}
          <button
            onClick={() => setGenericError(null)}
            className="ml-3 text-zinc-500 underline hover:text-zinc-300"
          >
            close
          </button>
        </div>
      )}

      {quotaError && (
        <PaywallCard
          err={quotaError}
          onReset={reset}
          onCheckout={startCheckout}
        />
      )}

      {report && (
        <ReportCard
          report={report}
          onReset={reset}
          onCheckout={startCheckout}
        />
      )}

      <footer className="mt-24 pt-8 border-t border-zinc-900 text-xs text-zinc-600">
        <p>13inks. We don&apos;t keep your file.</p>
      </footer>
    </div>
  );
}

function ReportCard({
  report,
  onReset,
  onCheckout,
}: {
  report: Report;
  onReset: () => void;
  onCheckout: (mode: "single" | "bundle" | "sub") => void;
}) {
  const tone =
    report.overallScore >= 70
      ? "fresh"
      : report.overallScore >= 40
        ? "drifting"
        : "stale";

  const accent =
    tone === "fresh"
      ? "text-emerald-400 border-emerald-400/30"
      : tone === "drifting"
        ? "text-amber-400 border-amber-400/30"
        : "text-rose-400 border-rose-400/30";

  const context =
    tone === "fresh"
      ? "Your doc tracks your code."
      : tone === "drifting"
        ? "Some claims have moved on."
        : "This file is describing a different codebase.";

  const flagged = report.claims.filter((c) => c.staleScore >= 40);

  return (
    <div className="space-y-8">
      <div
        className={`flex items-center justify-between gap-6 p-6 border rounded-lg ${accent}`}
      >
        <div className="flex items-center gap-6">
          <span className="text-6xl font-bold tabular-nums">
            {report.overallScore}
          </span>
          <div>
            <p className="text-xs uppercase tracking-wider opacity-70">
              Drift score
            </p>
            <p className="text-lg font-medium capitalize">{tone}</p>
            <p className="text-sm opacity-80 mt-0.5">{context}</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-zinc-500 hover:text-zinc-300 underline"
        >
          new check
        </button>
      </div>

      {flagged.length > 0 ? (
        <section>
          <h2 className="text-sm uppercase tracking-wider text-zinc-500 mb-3">
            Likely-stale claims ({flagged.length})
          </h2>
          <ul className="space-y-2">
            {flagged.slice(0, 12).map((c, i) => (
              <li
                key={i}
                className="border border-zinc-800 rounded-lg p-3 text-sm"
              >
                <p className="font-mono text-zinc-300 mb-1">
                  <span className="text-zinc-500">L{c.line}:</span>{" "}
                  <span className="text-zinc-100">{c.text}</span>
                </p>
                <p className="text-zinc-500">{c.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="text-sm text-zinc-400">
          Clean. Either your doc is current or you just got lucky.
        </section>
      )}

      {report.tier === "paid" &&
        report.suggestions &&
        report.suggestions.length > 0 && (
          <section>
            <h2 className="text-sm uppercase tracking-wider text-zinc-500 mb-3">
              Suggested rewrites
            </h2>
            <ul className="space-y-2">
              {report.suggestions.map((s, i) => (
                <li
                  key={i}
                  className="border border-amber-400/20 rounded-lg p-3 text-sm text-zinc-300"
                >
                  {s}
                </li>
              ))}
            </ul>
          </section>
        )}

      {report.tier === "free" && flagged.length > 0 && (
        <section className="border border-zinc-800 rounded-lg p-5">
          <p className="text-sm text-zinc-300 mb-3">
            We found the drift. Want the fix? One dollar.
          </p>
          <button
            onClick={() => onCheckout("single")}
            className="bg-zinc-100 text-zinc-950 font-medium px-4 py-2 rounded-lg hover:bg-white transition text-sm"
          >
            Refresh this file — $1
          </button>
        </section>
      )}

      {report.tier === "free" && report.quota && (
        <p className="text-xs text-zinc-600">
          {report.quota.remaining} free check
          {report.quota.remaining === 1 ? "" : "s"} left this week. Resets{" "}
          {new Date(report.quota.resetAt).toLocaleDateString()}.
        </p>
      )}
    </div>
  );
}

function PaywallCard({
  err,
  onReset,
  onCheckout,
}: {
  err: QuotaError;
  onReset: () => void;
  onCheckout: (mode: "single" | "bundle" | "sub") => void;
}) {
  return (
    <div className="border border-zinc-800 rounded-lg p-6 space-y-4">
      <p className="text-zinc-300">{err.message}</p>
      <p className="text-sm text-zinc-500">
        Resets {new Date(err.quota.resetAt).toLocaleDateString()}. Or run this
        one now for a dollar.
      </p>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          onClick={() => onCheckout("single")}
          className="bg-amber-400 text-zinc-950 font-semibold px-5 py-2.5 rounded-lg hover:bg-amber-300 transition"
        >
          {err.options.single_check.label}
        </button>
        <button
          onClick={() => onCheckout("sub")}
          className="text-sm text-zinc-300 hover:text-zinc-100 underline"
        >
          {err.options.subscribe.label}
        </button>
        <button
          onClick={onReset}
          className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 underline"
        >
          back
        </button>
      </div>
    </div>
  );
}
