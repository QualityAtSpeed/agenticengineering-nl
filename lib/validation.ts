import { z } from 'zod';

export const trainingInterestEnum = z.enum(['basic', 'advanced', 'other']);
export const deliveryPrefEnum = z.enum(['inCompany', 'remote', 'noPreference']);

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(200).default(''),
  trainingInterest: trainingInterestEnum,
  deliveryPref: deliveryPrefEnum,
  message: z.string().trim().min(10).max(5000),
  website: z.literal(''),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const attendeeSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
});

// Self-serve bookable trainings (Stripe checkout). Widen as more cohorts go self-serve.
export const bookableTrainingEnum = z.enum(['pilot', 'najaar-2026']);

export const bookingSchema = z.object({
  trainingId: bookableTrainingEnum,
  attendees: z.array(attendeeSchema).min(1).max(10),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type Attendee = z.infer<typeof attendeeSchema>;
