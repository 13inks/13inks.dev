import type { NextConfig } from "next";

// Deploy target: AWS Lightsail / EC2 behind nginx (NOT Vercel).
// Reason: flat-file state (.data/*.jsonl for quota, paid_tokens,
// stripe_events, patterns) needs a persistent filesystem; Vercel
// serverless wipes between cold starts. standalone output bundles
// node_modules into .next/standalone for clean containerization.
// All flat-file paths are env-var overridable so .data/ can be
// remapped to /var/lib/13inks on the host.
const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
