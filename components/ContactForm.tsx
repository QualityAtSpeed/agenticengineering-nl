'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { contactSchema, type ContactInput } from '@/lib/validation';

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'rateLimited';

export function ContactForm({ defaultTraining }: { defaultTraining?: 'basic' | 'advanced' }) {
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
      <div className="border-accent-green bg-bg-elevated rounded-sm border p-6">
        <p className="text-accent-green font-mono">// {t('success.title')}</p>
        <p className="text-text-muted mt-2">{t('success.body')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Field label={t('form.name')} error={fieldError(errors.name, 'other')}>
        <input
          type="text"
          autoComplete="name"
          data-testid="contact-name"
          {...register('name')}
          className="border-border-subtle bg-bg-elevated text-text-primary w-full rounded-sm border px-3 py-2 font-sans"
        />
      </Field>

      <Field label={t('form.email')} error={fieldError(errors.email, 'email')}>
        <input
          type="email"
          autoComplete="email"
          data-testid="contact-email"
          {...register('email')}
          className="border-border-subtle bg-bg-elevated text-text-primary w-full rounded-sm border px-3 py-2 font-sans"
        />
      </Field>

      <Field label={t('form.company')} error={fieldError(errors.company, 'other')}>
        <input
          type="text"
          autoComplete="organization"
          data-testid="contact-company"
          {...register('company')}
          className="border-border-subtle bg-bg-elevated text-text-primary w-full rounded-sm border px-3 py-2 font-sans"
        />
      </Field>

      <Field
        label={t('form.trainingInterest')}
        error={fieldError(errors.trainingInterest, 'other')}
      >
        <select
          data-testid="contact-training-interest"
          {...register('trainingInterest')}
          className="border-border-subtle bg-bg-elevated text-text-primary w-full rounded-sm border px-3 py-2 font-sans"
        >
          <option value="basic">{t('form.trainingOptions.basic')}</option>
          <option value="advanced">{t('form.trainingOptions.advanced')}</option>
          <option value="both">{t('form.trainingOptions.both')}</option>
          <option value="other">{t('form.trainingOptions.other')}</option>
        </select>
      </Field>

      <Field label={t('form.deliveryPref')} error={fieldError(errors.deliveryPref, 'other')}>
        <select
          data-testid="contact-delivery-pref"
          {...register('deliveryPref')}
          className="border-border-subtle bg-bg-elevated text-text-primary w-full rounded-sm border px-3 py-2 font-sans"
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
          className="border-border-subtle bg-bg-elevated text-text-primary w-full rounded-sm border px-3 py-2 font-sans"
        />
      </Field>

      <div className="hidden">
        <label>
          Leave this empty
          <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
        </label>
      </div>

      {status === 'error' && (
        <p className="text-accent-red font-mono text-sm">// {t('errors.generic')}</p>
      )}
      {status === 'rateLimited' && (
        <p className="text-accent-orange font-mono text-sm">// {t('errors.rateLimited')}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        data-testid="contact-submit"
        className="bg-accent-green text-bg-base inline-flex items-center gap-2 rounded-sm px-5 py-3 font-mono text-sm font-semibold hover:brightness-110 disabled:opacity-60"
      >
        {status === 'submitting' ? t('form.submitting') : t('form.submit')}
      </button>
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
      <span className="text-text-muted font-mono text-xs tracking-[0.2em] uppercase">{label}</span>
      <div className="mt-2">{children}</div>
      {error && <p className="text-accent-red mt-1 font-mono text-xs">// {error}</p>}
    </label>
  );
}
