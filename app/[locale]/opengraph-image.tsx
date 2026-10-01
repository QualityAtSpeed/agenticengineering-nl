import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

export const alt = 'agenticengineering.nl — agentic engineering trainings';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Satori (next/og) reads raw font data and supports TTF/OTF/WOFF, not WOFF2 or next/font.
// Static Rubik weights from @fontsource/rubik@5.3.0, read once at module scope.
const font = (file: string) => readFile(join(process.cwd(), 'assets/fonts', file));
const [rubikRegular, rubikSemiBold, rubikBold] = await Promise.all([
  font('rubik-latin-400-normal.woff'),
  font('rubik-latin-600-normal.woff'),
  font('rubik-latin-700-normal.woff'),
]);

export default async function Image({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#0f3b25',
        color: '#ffffff',
        padding: '80px',
        fontFamily: 'Rubik',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <svg width="64" height="64" viewBox="0 0 1080 1080">
          <g
            fill="none"
            stroke="#3fb950"
            strokeWidth="108"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 260 820 L 540 250 L 820 820" />
            <path d="M 380 605 L 700 605" />
          </g>
          <circle cx="540" cy="465" r="40" fill="#3fb950" />
        </svg>
        <span style={{ fontSize: 36, fontWeight: 600, color: '#e2ece5' }}>agentic·engineering</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div
          style={{
            display: 'flex',
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          {t('title')}
        </div>
        <span style={{ fontSize: 32, fontWeight: 400, color: '#a9c2b2' }}>{t('subtitle')}</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Rubik', data: rubikRegular, weight: 400, style: 'normal' },
        { name: 'Rubik', data: rubikSemiBold, weight: 600, style: 'normal' },
        { name: 'Rubik', data: rubikBold, weight: 700, style: 'normal' },
      ],
    },
  );
}
