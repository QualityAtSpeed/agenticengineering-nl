'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

type Mode = 'light' | 'dark' | 'system';
const MODES: Mode[] = ['light', 'dark', 'system'];

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export function ThemeToggle() {
  const t = useTranslations('theme');
  // theme = stored preference (light/dark/system); resolvedTheme = the effective one
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  // Before mount, render a stable placeholder to avoid hydration mismatch.
  const showMoon = mounted && resolvedTheme === 'dark';

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t('label')}
        onClick={() => setOpen((v) => !v)}
        data-testid="theme-toggle"
        className="text-text-soft hover:text-brand inline-flex h-8 w-8 items-center justify-center"
      >
        {showMoon ? <MoonIcon /> : <SunIcon />}
      </button>
      {open && (
        <div
          id={panelId}
          role="menu"
          aria-label={t('label')}
          className="border-border-subtle bg-bg-base absolute top-full right-0 mt-2 min-w-32 rounded-md border py-1 text-sm shadow-lg"
        >
          {MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              role="menuitemradio"
              aria-checked={mounted && theme === mode}
              data-testid={`theme-option-${mode}`}
              onClick={() => {
                setTheme(mode);
                setOpen(false);
              }}
              className="text-text-soft hover:bg-bg-tint hover:text-brand flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left"
            >
              <span>{t(mode)}</span>
              {mounted && theme === mode ? <span aria-hidden>✓</span> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
