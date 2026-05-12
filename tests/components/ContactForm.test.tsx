import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import nl from '@/messages/nl.json';
import { ContactForm } from '@/components/ContactForm';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) }),
  );
});

function renderForm() {
  return render(
    <NextIntlClientProvider locale="nl" messages={nl}>
      <ContactForm />
    </NextIntlClientProvider>,
  );
}

describe('<ContactForm />', () => {
  it('shows success state after valid submit', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(/Naam/), 'Pascal');
    await user.type(screen.getByLabelText(/E-mail/), 'pascal@example.com');
    await user.type(
      screen.getByLabelText(/Bericht/),
      'Wij willen graag de basic training boeken voor ons team.',
    );
    await user.click(screen.getByRole('button', { name: /Verzenden/ }));
    await waitFor(() => {
      expect(screen.getByText(/Verzonden/)).toBeInTheDocument();
    });
  });

  it('shows error banner on 502 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 502, json: async () => ({}) }),
    );
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(/Naam/), 'Pascal');
    await user.type(screen.getByLabelText(/E-mail/), 'pascal@example.com');
    await user.type(screen.getByLabelText(/Bericht/), 'Voldoende lange testbericht hier.');
    await user.click(screen.getByRole('button', { name: /Verzenden/ }));
    await waitFor(() => {
      expect(screen.getByText(/Er ging iets mis/)).toBeInTheDocument();
    });
  });
});
