'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { contactSchema, type ContactInput } from '@/lib/validation';
import { Button } from '@/components/Button';

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'rateLimited';

const INPUT_CLASS =
  'border-border-strong bg-bg-base text-text-primary focus:border-brand focus:ring-brand/20 w-full rounded-md border px-3 py-2 text-[0.9375rem] focus:ring-2 focus:outline-none';

export function ContactForm({
  defaultTraining,
}: {
  defaultTraining?: 'pilot' | 'basic' | 'advanced';
}) {
  const t = useTranslations('contact');
  const [status, setStatus] = useState<Status>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      trainingInterest: defaultTraining ?? 'basic',
      deliveryPref: 'noPreference',
      message: '',
      website: '',
    },
  } as const);

  const fieldError = (
    err: { type?: string } | undefined,
    kind: 'email' | 'message' | 'other',
  ): string | undefined => {
    if (!err) return undefined;
    if (kind === 'email') return t('errors.invalidEmail');
    if (kind === 'message') {
      return err.type === 'too_big' ? t('errors.messageTooLong') : t('errors.messageTooShort');
    }
    return t('errors.required');
  };

  async function onSubmit(values: ContactInput) {
    setStatus('submitting');
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) setStatus('success');
    else if (res.status === 429) setStatus('rateLimited');
    else setStatus('error');
  }

  if (status === 'success') {
    return (
      <div
        className="border-accent-green/30 bg-accent-green/10 rounded-md border p-5"
        data-testid="contact-success"
      >
        <p className="text-accent-green-hover font-semibold">{t('success.title')}</p>
        <p className="text-text-soft mt-1.5 text-[0.9375rem]">{t('success.body')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field label={t('form.name')} error={fieldError(errors.name, 'other')}>
        <input
          type="text"
          autoComplete="name"
          data-testid="contact-name"
          {...register('name')}
          className={INPUT_CLASS}
        />
      </Field>

      <Field label={t('form.email')} error={fieldError(errors.email, 'email')}>
        <input
          type="email"
          autoComplete="email"
          data-testid="contact-email"
          {...register('email')}
          className={INPUT_CLASS}
        />
      </Field>

      <Field label={t('form.company')} error={fieldError(errors.company, 'other')}>
        <input
          type="text"
          autoComplete="organization"
          data-testid="contact-company"
          {...register('company')}
          className={INPUT_CLASS}
        />
      </Field>

      <Field
        label={t('form.trainingInterest')}
        error={fieldError(errors.trainingInterest, 'other')}
      >
        <select
          data-testid="contact-training-interest"
          {...register('trainingInterest')}
          className={INPUT_CLASS}
        >
          <option value="pilot">{t('form.trainingOptions.pilot')}</option>
          <option value="basic">{t('form.trainingOptions.basic')}</option>
          <option value="advanced">{t('form.trainingOptions.advanced')}</option>
          <option value="other">{t('form.trainingOptions.other')}</option>
        </select>
      </Field>

      <Field label={t('form.deliveryPref')} error={fieldError(errors.deliveryPref, 'other')}>
        <select
          data-testid="contact-delivery-pref"
          {...register('deliveryPref')}
          className={INPUT_CLASS}
        >
          <option value="noPreference">{t('form.deliveryOptions.noPreference')}</option>
          <option value="inCompany">{t('form.deliveryOptions.inCompany')}</option>
          <option value="publicCohort">{t('form.deliveryOptions.publicCohort')}</option>
          <option value="remote">{t('form.deliveryOptions.remote')}</option>
        </select>
      </Field>

      <Field label={t('form.message')} error={fieldError(errors.message, 'message')}>
        <textarea
          rows={6}
          data-testid="contact-message"
          {...register('message')}
          className={INPUT_CLASS}
        />
      </Field>

      <div className="hidden">
        <label>
          Leave this empty
          <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
        </label>
      </div>

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

      <Button type="submit" disabled={status === 'submitting'} data-testid="contact-submit">
        {status === 'submitting' ? t('form.submitting') : t('form.submit')}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-text-primary text-sm font-semibold">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error && <p className="text-accent-red mt-1.5 text-xs">{error}</p>}
    </label>
  );
}
