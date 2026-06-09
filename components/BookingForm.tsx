'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { bookingSchema, type BookingInput } from '@/lib/validation';
import { Button } from '@/components/Button';

type Status = 'idle' | 'submitting' | 'error' | 'rateLimited';

const INPUT_CLASS =
  'border-border-strong bg-bg-base text-text-primary focus:border-brand focus:ring-brand/20 w-full rounded-md border px-3 py-2 text-[0.9375rem] focus:ring-2 focus:outline-none';

const MAX_SEATS = 10;

export function BookingForm({ locale }: { locale: string }) {
  const t = useTranslations('booking');
  const [status, setStatus] = useState<Status>('idle');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { trainingId: 'pilot', attendees: [{ name: '', email: '' }] },
  });

  const { fields, replace } = useFieldArray({ control, name: 'attendees' });

  function setSeats(n: number) {
    const next = Array.from({ length: n }, (_, i) => fields[i] ?? { name: '', email: '' });
    replace(next);
  }

  async function onSubmit(values: BookingInput) {
    setStatus('submitting');
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      const { url } = (await res.json()) as { url: string };
      window.location.assign(url);
      return;
    }
    setStatus(res.status === 429 ? 'rateLimited' : 'error');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register('trainingId')} value="pilot" />

      <label className="block">
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
          className="border-border-subtle grid gap-3 rounded-md border p-4 sm:grid-cols-2"
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

      <Button type="submit" disabled={status === 'submitting'} data-testid="booking-submit">
        {status === 'submitting' ? t('submitting') : t('submit')}
      </Button>

      <p className="text-text-muted text-sm">
        <a
          href={`/${locale}/contact?training=pilot`}
          className="underline"
          data-testid="booking-contact-link"
        >
          {t('contactLink')}
        </a>
      </p>
    </form>
  );
}
