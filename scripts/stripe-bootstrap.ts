// One-shot: create the three Stripe Prices for freshness.13inks.dev
// and print env-var lines to paste into .env.local.
//
// Usage:
//   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/stripe-bootstrap.ts
//
// Idempotency: looks up products by metadata.tag before creating; same for
// prices. Re-running prints the existing IDs rather than duplicating.

import Stripe from "stripe";

const TAG = "freshness.13inks.dev";

interface Plan {
  envVar: string;
  productName: string;
  productMetaKey: string;
  amountCents: number;
  interval: "one_time" | "month";
  description: string;
}

const PLANS: Plan[] = [
  {
    envVar: "STRIPE_PRICE_SINGLE",
    productName: "Freshness — single check",
    productMetaKey: "single",
    amountCents: 100,
    interval: "one_time",
    description: "One file. Full freshness package.",
  },
  {
    envVar: "STRIPE_PRICE_BUNDLE",
    productName: "Freshness — full agent audit",
    productMetaKey: "bundle",
    amountCents: 500,
    interval: "one_time",
    description: "CLAUDE.md + skills + memories + agents in one pass.",
  },
  {
    envVar: "STRIPE_PRICE_SUB",
    productName: "Freshness — monthly",
    productMetaKey: "sub",
    amountCents: 900,
    interval: "month",
    description: "12 credits/mo, rolls over. Monthly drift report.",
  },
];

async function findOrCreateProduct(stripe: Stripe, p: Plan): Promise<Stripe.Product> {
  const search = await stripe.products.search({
    query: `metadata['tag']:'${TAG}' AND metadata['key']:'${p.productMetaKey}'`,
  });
  if (search.data.length > 0) return search.data[0];
  return stripe.products.create({
    name: p.productName,
    description: p.description,
    metadata: { tag: TAG, key: p.productMetaKey },
  });
}

async function findOrCreatePrice(
  stripe: Stripe,
  product: Stripe.Product,
  p: Plan,
): Promise<Stripe.Price> {
  const search = await stripe.prices.search({
    query: `product:'${product.id}' AND metadata['tag']:'${TAG}' AND active:'true'`,
  });
  for (const existing of search.data) {
    if (
      existing.unit_amount === p.amountCents &&
      ((p.interval === "one_time" && !existing.recurring) ||
        (p.interval === "month" && existing.recurring?.interval === "month"))
    ) {
      return existing;
    }
  }
  return stripe.prices.create({
    product: product.id,
    unit_amount: p.amountCents,
    currency: "usd",
    recurring: p.interval === "month" ? { interval: "month" } : undefined,
    metadata: { tag: TAG, key: p.productMetaKey },
  });
}

async function main(): Promise<void> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error("STRIPE_SECRET_KEY missing. Aborting.");
    process.exit(1);
  }
  const stripe = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });

  console.error(`# bootstrapping Stripe products+prices (tag=${TAG})`);
  const out: Record<string, string> = {};
  for (const p of PLANS) {
    const product = await findOrCreateProduct(stripe, p);
    const price = await findOrCreatePrice(stripe, product, p);
    console.error(`#   ${p.productMetaKey.padEnd(7)} product=${product.id} price=${price.id}`);
    out[p.envVar] = price.id;
  }
  console.error(`# done — paste the lines below into .env.local:\n`);
  for (const [k, v] of Object.entries(out)) console.log(`${k}=${v}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
