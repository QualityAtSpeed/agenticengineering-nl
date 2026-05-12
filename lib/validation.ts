import { z } from 'zod';

export const trainingInterestEnum = z.enum(['basic', 'advanced', 'both', 'other']);
export const deliveryPrefEnum = z.enum(['inCompany', 'publicCohort', 'remote', 'noPreference']);

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(200).optional().default(''),
  trainingInterest: trainingInterestEnum,
  deliveryPref: deliveryPrefEnum,
  message: z.string().trim().min(10).max(5000),
  website: z.literal(''),
});

export type ContactInput = z.infer<typeof contactSchema>;
