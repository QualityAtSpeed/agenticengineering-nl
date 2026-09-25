import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/Hero';

describe('<Hero />', () => {
  it('is a dark band', () => {
    const { container } = render(
      <Hero
        kicker="K"
        title="T"
        subtitle="S"
        primaryCta={{ label: 'Go', href: '/nl/trainings' }}
      />,
    );
    expect(container.querySelector('section')).toHaveClass('surface-dark');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('T');
  });

  it('has no hardcoded blue in the dot grid', () => {
    // jsdom may drop color-mix() from inline styles, so assert the old value is gone.
    const { container } = render(
      <Hero
        kicker="K"
        title="T"
        subtitle="S"
        primaryCta={{ label: 'Go', href: '/nl/trainings' }}
      />,
    );
    const dots = container.querySelector('[aria-hidden]') as HTMLElement;
    expect(dots.getAttribute('style') ?? '').not.toMatch(/11,\s*111,\s*176/);
  });
});
