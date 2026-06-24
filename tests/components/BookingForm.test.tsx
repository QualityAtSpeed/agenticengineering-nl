import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import nl from '@/messages/nl.json';
import { BookingForm } from '@/components/BookingForm';

function renderForm() {
  return render(
    <NextIntlClientProvider locale="nl" messages={nl}>
      <BookingForm locale="nl" />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('BookingForm', () => {
  it('renders one attendee row by default', () => {
    renderForm();
    expect(screen.getAllByTestId(/booking-attendee-name-/)).toHaveLength(1);
  });

  it('grows attendee rows when seat count increases', () => {
    renderForm();
    fireEvent.change(screen.getByTestId('booking-seats'), { target: { value: '3' } });
    expect(screen.getAllByTestId(/booking-attendee-name-/)).toHaveLength(3);
  });

  it('posts to /api/checkout and redirects to the Stripe url', async () => {
    const assignMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { assign: assignMock },
      writable: true,
      configurable: true,
    });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://checkout.stripe.com/x' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    renderForm();
    fireEvent.input(screen.getByTestId('booking-attendee-name-0'), { target: { value: 'Pascal' } });
    fireEvent.input(screen.getByTestId('booking-attendee-email-0'), {
      target: { value: 'pascal@example.com' },
    });
    fireEvent.click(screen.getByTestId('booking-submit'));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/checkout', expect.anything()));
    await waitFor(() => expect(assignMock).toHaveBeenCalledWith('https://checkout.stripe.com/x'));
  });

  it('renders the optional referral code field', () => {
    renderForm();
    expect(screen.getByTestId('booking-referral-code')).toBeInTheDocument();
  });

  it('shows an invalid-referral message when the API rejects the code', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, error: 'invalid_referral' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    renderForm();
    fireEvent.input(screen.getByTestId('booking-attendee-name-0'), { target: { value: 'Pascal' } });
    fireEvent.input(screen.getByTestId('booking-attendee-email-0'), {
      target: { value: 'pascal@example.com' },
    });
    fireEvent.input(screen.getByTestId('booking-referral-code'), { target: { value: 'NOPE' } });
    fireEvent.click(screen.getByTestId('booking-submit'));

    await waitFor(() =>
      expect(screen.getByText(nl.booking.errors.invalidReferral)).toBeInTheDocument(),
    );
  });
});
