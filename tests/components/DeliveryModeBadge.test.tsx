import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import nl from '@/messages/nl.json';
import en from '@/messages/en.json';
import { DeliveryModeBadge } from '@/components/DeliveryModeBadge';

function renderBadge(courseMode: string[] | undefined, locale: 'nl' | 'en' = 'nl') {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === 'nl' ? nl : en}>
      <DeliveryModeBadge courseMode={courseMode} />
    </NextIntlClientProvider>,
  );
}

describe('<DeliveryModeBadge />', () => {
  it('shows "Online" for an online-only course mode', () => {
    renderBadge(['online']);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('shows "Op locatie" for an in-person-only course mode', () => {
    renderBadge(['inPerson']);
    expect(screen.getByText('Op locatie')).toBeInTheDocument();
  });

  it('shows both when the cohort is online and on-site', () => {
    renderBadge(['online', 'inPerson']);
    expect(screen.getByText('Online & op locatie')).toBeInTheDocument();
  });

  it('renders nothing without a course mode', () => {
    const { container } = renderBadge(undefined);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for an empty course mode', () => {
    const { container } = renderBadge([]);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the English on-site label', () => {
    renderBadge(['inPerson'], 'en');
    expect(screen.getByText('On-site')).toBeInTheDocument();
  });
});
