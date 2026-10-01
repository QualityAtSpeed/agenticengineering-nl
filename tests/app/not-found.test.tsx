import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '@/app/[locale]/not-found';

describe('404 page', () => {
  it('is a single dark band', () => {
    render(<NotFound />);
    expect(screen.getByRole('main')).toHaveClass('surface-dark');
  });
});
