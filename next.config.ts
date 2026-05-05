import type { NextConfig } from "next";

// Hybrid mode for Vercel: marketing pages still prerender, server routes
// (api/check-freshness, Stripe webhooks, magic-link) run at request time.
// Switched off "export" 2026-05-05 when freshness flow needed server routes.
const nextConfig: NextConfig = {};

export default nextConfig;
