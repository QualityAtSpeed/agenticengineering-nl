import { trainings, type TrainingId } from '@/data/trainings';

export const VAT_RATE = 0.21;

export type PriceBreakdown = {
  netCents: number;
  vatCents: number;
  grossCents: number;
};

export function priceWithVat(trainingId: TrainingId): PriceBreakdown {
  const netCents = trainings[trainingId].priceEUR * 100;
  const vatCents = Math.round(netCents * VAT_RATE);
  return { netCents, vatCents, grossCents: netCents + vatCents };
}
