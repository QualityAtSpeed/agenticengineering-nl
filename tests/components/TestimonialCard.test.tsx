import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestimonialCard } from '@/components/TestimonialCard';

describe('<TestimonialCard />', () => {
  it('renders the quote inside a blockquote element', () => {
    render(<TestimonialCard quote="Great training" name="Jane Doe" role="Lead, Acme" />);
    const quote = screen.getByText('Great training');
    expect(quote.tagName).toBe('BLOCKQUOTE');
  });

  it('renders the attribution name and role inside a cite element', () => {
    render(<TestimonialCard quote="Great training" name="Jane Doe" role="Lead, Acme" />);
    const cite = screen.getByText(/Jane Doe/);
    expect(cite.tagName).toBe('CITE');
    expect(cite).toHaveTextContent('Lead, Acme');
  });
});
