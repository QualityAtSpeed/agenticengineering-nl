import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from '@/components/PageHeader';

describe('<PageHeader />', () => {
  it('renders the title as the only h1 inside a dark band', () => {
    render(<PageHeader title="Over ons" />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Over ons');
    expect(screen.getByTestId('page-header')).toHaveClass('surface-dark');
  });

  it('leaves room for the floating nav', () => {
    render(<PageHeader title="x" />);
    expect(screen.getByTestId('page-header')).toHaveClass('pt-36');
  });

  it('renders intro and children when given', () => {
    render(
      <PageHeader title="x" intro="Intro tekst">
        <span>badge</span>
      </PageHeader>,
    );
    expect(screen.getByText('Intro tekst')).toBeInTheDocument();
    expect(screen.getByText('badge')).toBeInTheDocument();
  });

  it('omits the intro paragraph when not given', () => {
    const { container } = render(<PageHeader title="x" />);
    expect(container.querySelector('p')).toBeNull();
  });

  it('applies the requested content width', () => {
    const { container } = render(<PageHeader title="x" width="max-w-2xl" />);
    expect(container.querySelector('.max-w-2xl')).not.toBeNull();
  });
});
