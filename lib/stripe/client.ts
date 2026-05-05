import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  cached = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
  return cached;
}

export const PRICE_IDS = {
  single: () => requireEnv("STRIPE_PRICE_SINGLE"),
  bundle: () => requireEnv("STRIPE_PRICE_BUNDLE"),
  sub: () => requireEnv("STRIPE_PRICE_SUB"),
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set`);
  return v;
}

export type CheckoutMode = "single" | "bundle" | "sub";
