import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type Variant = 'primary' | 'secondary';
type Size = 'md' | 'sm';

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-accent-green hover:bg-accent-green-hover text-white shadow-sm border border-transparent',
  secondary:
    'border-border-strong text-brand hover:border-brand hover:text-brand-deep bg-bg-base border',
};

const SIZE: Record<Size, string> = {
  md: 'px-5 py-2.5 text-sm',
  sm: 'px-3 py-1.5 text-sm',
};

const BASE =
  'inline-flex items-center gap-2 rounded-md font-semibold transition-colors disabled:opacity-60';

function classes(variant: Variant, size: Size, fullWidth: boolean, extra?: string) {
  return [BASE, VARIANT[variant], SIZE[size], fullWidth ? 'w-full justify-center' : '', extra ?? '']
    .filter(Boolean)
    .join(' ');
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonLinkProps = CommonProps & {
  href: string;
  external?: boolean;
} & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'className' | 'children'>;

type ButtonNativeProps = CommonProps &
  Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'> & {
    href?: undefined;
  };

export type ButtonProps = ButtonLinkProps | ButtonNativeProps;

function isLink(props: ButtonProps): props is ButtonLinkProps {
  return typeof (props as ButtonLinkProps).href === 'string';
}

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', fullWidth = false, className, children } = props;
  const cls = classes(variant, size, fullWidth, className);

  if (isLink(props)) {
    const {
      href,
      external,
      variant: _v,
      size: _s,
      fullWidth: _f,
      className: _c,
      children: _ch,
      ...rest
    } = props;
    void _v;
    void _s;
    void _f;
    void _c;
    void _ch;
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, fullWidth: _f, className: _c, children: _ch, ...rest } = props;
  void _v;
  void _s;
  void _f;
  void _c;
  void _ch;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
