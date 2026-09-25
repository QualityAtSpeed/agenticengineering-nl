import type { ReactNode } from 'react';

type Width = 'max-w-2xl' | 'max-w-3xl' | 'max-w-4xl';

// Dark header band for subpages. pt-36 leaves room for the floating nav (Nav.tsx, h-0).
export function PageHeader({
  title,
  intro,
  children,
  width = 'max-w-4xl',
}: {
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  width?: Width;
}) {
  return (
    <header
      data-testid="page-header"
      className="surface-dark border-border-subtle border-b px-6 pt-36 pb-14"
    >
      <div className={`mx-auto ${width}`}>
        <h1 className="text-brand-deep text-3xl font-bold break-words sm:text-4xl">{title}</h1>
        {intro && <p className="text-text-soft mt-3 text-lg">{intro}</p>}
        {children}
      </div>
    </header>
  );
}
