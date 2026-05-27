import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import nl from '@/messages/nl.json';
import { ProofStrip } from '@/components/ProofStrip';

function renderStrip(locale: 'nl' | 'en') {
  const messages = locale === 'nl' ? nl : en;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ProofStrip locale={locale} />
    </NextIntlClientProvider>,
  );
}

describe('<ProofStrip />', () => {
  it('renders the EN heading and subhead from i18n', () => {
    renderStrip('en');
    expect(screen.getByRole('heading', { name: /We ship what we teach/ })).toBeInTheDocument();
    expect(screen.getByText(/This site runs the stack you'll learn/)).toBeInTheDocument();
  });

  it('renders the NL heading from i18n', () => {
    renderStrip('nl');
    expect(screen.getByRole('heading', { name: /We leveren wat we trainen/ })).toBeInTheDocument();
  });

  it('renders exactly 5 pills as list items', () => {
    renderStrip('en');
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);
  });

  it('renders the GitHub CTA with correct href, target, and rel', () => {
    renderStrip('en');
    const link = screen.getByTestId('proof-github-link');
    expect(link).toHaveAttribute('href', 'https://github.com/QualityAtSpeed/agenticengineering-nl');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveTextContent(/view source on GitHub/);
  });

  it('renders the NL CTA label', () => {
    renderStrip('nl');
    expect(screen.getByTestId('proof-github-link')).toHaveTextContent(/bekijk source op GitHub/);
  });
});
