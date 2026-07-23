'use client';

import { useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { bookingSchema, type BookingInput, type BookingFormInput } from '@/lib/validation';
import { Button } from '@/components/Button';

type Status = 'idle' | 'submitting' | 'error' | 'rateLimited' | 'invalidReferral';

const INPUT_CLASS =
  'border-border-strong bg-bg-base text-text-primary focus:border-brand focus:ring-brand/20 w-full rounded-md border px-3 py-2 text-[0.9375rem] focus:ring-2 focus:outline-none';

const MAX_SEATS = 10;

export function BookingForm({
  locale,
  trainingId = 'pilot',
}: {
  locale: string;
  trainingId?: BookingInput['trainingId'];
}) {
  const t = useTranslations('booking');
  const [status, setStatus] = useState<Status>('idle');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BookingFormInput, unknown, BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      trainingId,
      attendees: [{ name: '', email: '' }],
      accountType: 'zakelijk',
      company: '',
      kvk: '',
      street: '',
      zipCode: '',
      city: '',
      country: 'Nederland',
      notes: '',
      referralCode: '',
    },
  });

  const { fields, replace } = useFieldArray({ control, name: 'attendees' });

  const accountType = useWatch({ control, name: 'accountType' });
  const isBusiness = accountType === 'zakelijk';

  function setSeats(n: number) {
    const next = Array.from({ length: n }, (_, i) => fields[i] ?? { name: '', email: '' });
    replace(next);
  }

  async function onSubmit(values: BookingInput) {
    setStatus('submitting');
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...values, locale }),
    });
    if (res.ok) {
      const { url } = (await res.json()) as { url: string };
      window.location.assign(url);
      return;
    }
    if (res.status === 429) {
      setStatus('rateLimited');
      return;
    }
    if (res.status === 400) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      if (body?.error === 'invalid_referral') {
        setStatus('invalidReferral');
        return;
      }
    }
    setStatus('error');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register('trainingId')} value={trainingId} />

      <div className="border-border-subtle space-y-5 rounded-md border p-4">
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="text-text-primary mb-1.5 text-sm font-semibold">
            {t('companyHeading')}
          </legend>

          <div className="flex gap-4 sm:col-span-2" role="radiogroup">
            <label className="text-text-muted flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="zakelijk"
                data-testid="booking-account-business"
                {...register('accountType')}
                className="accent-brand/60"
              />
              {t('accountBusiness')}
            </label>
            <label className="text-text-muted flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="persoonlijk"
                data-testid="booking-account-personal"
                {...register('accountType')}
                className="accent-brand/60"
              />
              {t('accountPersonal')}
            </label>
          </div>

          {isBusiness && (
            <label className="block sm:col-span-2">
              <span className="text-text-primary text-sm font-semibold">{t('company')}</span>
              <input
                type="text"
                data-testid="booking-company"
                {...register('company')}
                className={`${INPUT_CLASS} mt-1.5`}
              />
              {errors.company && (
                <p className="text-accent-red mt-1.5 text-xs">{t('errors.required')}</p>
              )}
            </label>
          )}

          {isBusiness && (
            <label className="block sm:col-span-2">
              <span className="text-text-primary text-sm font-semibold">{t('kvk')}</span>
              <input
                type="text"
                inputMode="numeric"
                data-testid="booking-kvk"
                {...register('kvk')}
                className={`${INPUT_CLASS} mt-1.5`}
              />
              {errors.kvk && (
                <p className="text-accent-red mt-1.5 text-xs">{t('errors.invalidKvk')}</p>
              )}
            </label>
          )}

          <label className="block sm:col-span-2">
            <span className="text-text-primary text-sm font-semibold">{t('street')}</span>
            <input
              type="text"
              data-testid="booking-street"
              {...register('street')}
              className={`${INPUT_CLASS} mt-1.5`}
            />
            {errors.street && (
              <p className="text-accent-red mt-1.5 text-xs">{t('errors.required')}</p>
            )}
          </label>

          <label className="block">
            <span className="text-text-primary text-sm font-semibold">{t('zipCode')}</span>
            <input
              type="text"
              data-testid="booking-zipcode"
              {...register('zipCode')}
              className={`${INPUT_CLASS} mt-1.5`}
            />
            {errors.zipCode && (
              <p className="text-accent-red mt-1.5 text-xs">{t('errors.required')}</p>
            )}
          </label>

          <label className="block">
            <span className="text-text-primary text-sm font-semibold">{t('city')}</span>
            <input
              type="text"
              data-testid="booking-city"
              {...register('city')}
              className={`${INPUT_CLASS} mt-1.5`}
            />
            {errors.city && (
              <p className="text-accent-red mt-1.5 text-xs">{t('errors.required')}</p>
            )}
          </label>

          <label className="block sm:col-span-2">
            <span className="text-text-primary text-sm font-semibold">{t('country')}</span>
            <input
              type="text"
              data-testid="booking-country"
              {...register('country')}
              className={`${INPUT_CLASS} mt-1.5`}
            />
            {errors.country && (
              <p className="text-accent-red mt-1.5 text-xs">{t('errors.required')}</p>
            )}
          </label>

          <label className="block sm:col-span-2">
            <span className="text-text-primary text-sm font-semibold">{t('notes')}</span>
            <textarea
              rows={4}
              maxLength={500}
              data-testid="booking-notes"
              {...register('notes')}
              className={`${INPUT_CLASS} mt-1.5`}
            />
          </label>
        </fieldset>

        <label className="border-border-subtle block border-t pt-5">
          <span className="text-text-primary text-sm font-semibold">{t('seatsLabel')}</span>
          <div className="mt-1.5">
            <select
              data-testid="booking-seats"
              defaultValue="1"
              onChange={(e) => setSeats(Number(e.target.value))}
              className={INPUT_CLASS}
            >
              {Array.from({ length: MAX_SEATS }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </label>

        {fields.map((field, i) => (
          <div
            key={field.id}
            className="border-border-subtle grid gap-3 border-t pt-5 sm:grid-cols-2"
          >
            <label className="block">
              <span className="text-text-primary text-sm font-semibold">{t('attendeeName')}</span>
              <input
                type="text"
                data-testid={`booking-attendee-name-${i}`}
                {...register(`attendees.${i}.name` as const)}
                className={`${INPUT_CLASS} mt-1.5`}
              />
              {errors.attendees?.[i]?.name && (
                <p className="text-accent-red mt-1.5 text-xs">{t('errors.required')}</p>
              )}
            </label>
            <label className="block">
              <span className="text-text-primary text-sm font-semibold">{t('attendeeEmail')}</span>
              <input
                type="email"
                data-testid={`booking-attendee-email-${i}`}
                {...register(`attendees.${i}.email` as const)}
                className={`${INPUT_CLASS} mt-1.5`}
              />
              {errors.attendees?.[i]?.email && (
                <p className="text-accent-red mt-1.5 text-xs">{t('errors.invalidEmail')}</p>
              )}
            </label>
          </div>
        ))}
      </div>

      <label className="block">
        <span className="text-text-primary text-sm font-semibold">{t('referralLabel')}</span>
        <input
          type="text"
          data-testid="booking-referral-code"
          {...register('referralCode')}
          className={`${INPUT_CLASS} mt-1.5`}
        />
        <span className="text-text-muted mt-1 block text-xs">{t('referralHint')}</span>
      </label>

      {status === 'error' && (
        <p className="border-accent-red/30 bg-accent-red/10 text-accent-red rounded-md border px-3 py-2 text-sm">
          {t('errors.generic')}
        </p>
      )}
      {status === 'rateLimited' && (
        <p className="border-accent-orange/30 bg-accent-orange/10 text-accent-orange rounded-md border px-3 py-2 text-sm">
          {t('errors.rateLimited')}
        </p>
      )}
      {status === 'invalidReferral' && (
        <p className="border-accent-red/30 bg-accent-red/10 text-accent-red rounded-md border px-3 py-2 text-sm">
          {t('errors.invalidReferral')}
        </p>
      )}

      <Button type="submit" disabled={status === 'submitting'} data-testid="booking-submit">
        {status === 'submitting' ? t('submitting') : t('submit')}
      </Button>

      <p className="text-text-muted text-sm">
        <a href={`/${locale}/contact`} className="underline" data-testid="booking-contact-link">
          {t('contactLink')}
        </a>
      </p>
    </form>
  );
}
