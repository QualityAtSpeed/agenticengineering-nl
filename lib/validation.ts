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
export const bookableTrainingEnum = z.enum(['pilot', 'discount-aug-26']);

export const accountTypeEnum = z.enum(['zakelijk', 'persoonlijk']);

export const bookingSchema = z
  .object({
    trainingId: bookableTrainingEnum,
    attendees: z.array(attendeeSchema).min(1).max(10),
    accountType: accountTypeEnum.default('zakelijk'),
    company: z.string().trim().max(200).default(''),
    kvk: z
      .string()
      .trim()
      .regex(/^\d{8}$/)
      .or(z.literal('')),
    zipCode: z.string().trim().min(2).max(12),
    street: z.string().trim().min(1).max(100),
    city: z.string().trim().min(1).max(100),
    country: z.string().trim().min(1).max(100),
    notes: z.string().trim().max(500),
  })
  // Company name is only required for a business (zakelijk) booking.
  .superRefine((data, ctx) => {
    if (data.accountType === 'zakelijk' && data.company.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['company'],
        message: 'required',
      });
    }
  });

export type BookingInput = z.infer<typeof bookingSchema>;
// Form-side type: fields with .default() are optional on input, required on output.
export type BookingFormInput = z.input<typeof bookingSchema>;
export type Attendee = z.infer<typeof attendeeSchema>;
