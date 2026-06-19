import { trainings, type TrainingId } from '@/data/trainings';

export const VAT_RATE = 0.21;

export type PriceBreakdown = {
  netCents: number;
  vatCents: number;
  grossCents: number;
  // Net price before any early-bird discount (equals netCents when none applies).
  baseNetCents: number;
  // Whether an early-bird discount is currently applied.
  earlyBird: boolean;
};

function withVat(netCents: number, baseNetCents: number, earlyBird: boolean): PriceBreakdown {
  const vatCents = Math.round(netCents * VAT_RATE);
  return { netCents, vatCents, grossCents: netCents + vatCents, baseNetCents, earlyBird };
}

// Price for a training at a given moment. Applies the early-bird discount while
// `now` is strictly before the deadline (deadline exclusive). `now` is injected
// so the function stays pure + testable; the checkout passes the real time, so
// the discount is server-enforced and not just a display value.
export function priceFor(trainingId: TrainingId, now: Date = new Date()): PriceBreakdown {
  const training = trainings[trainingId];
  const baseNetCents = training.priceEUR * 100;
  const eb = training.earlyBird;
  if (eb && now < new Date(eb.deadline)) {
    const netCents = Math.round(baseNetCents * (1 - eb.discountPct / 100));
    return withVat(netCents, baseNetCents, true);
  }
  return withVat(baseNetCents, baseNetCents, false);
}

// Convenience wrapper at the current time (kept for existing callers).
export function priceWithVat(trainingId: TrainingId): PriceBreakdown {
  return priceFor(trainingId);
}
