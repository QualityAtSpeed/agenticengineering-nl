import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'agenticengineering.nl — agentic engineering trainings';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#0d1117',
        color: '#c9d1d9',
        padding: '80px',
        fontFamily: 'monospace',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <svg width="64" height="64" viewBox="0 0 1080 1080">
          <rect width="1080" height="1080" rx="188" fill="#0f1108" />
          <g
            fill="none"
            stroke="#7ee787"
            strokeWidth="108"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 260 820 L 540 250 L 820 820" />
            <path d="M 380 605 L 700 605" />
          </g>
          <circle cx="540" cy="465" r="40" fill="#7ee787" />
        </svg>
        <span style={{ fontSize: 36, color: '#c9d1d9' }}>agentic·engineering</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', fontSize: 84, lineHeight: 1.05 }}>
          <span style={{ color: '#7ee787', marginRight: '24px' }}>&gt;</span>
          <span>Train your team in agentic engineering.</span>
        </div>
        <span style={{ fontSize: 32, color: '#8b949e' }}>
          Two hands-on trainings in Claude Code.
        </span>
      </div>
    </div>,
    { ...size },
  );
}
