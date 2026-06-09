import { describe, it, expect } from 'vitest';
import { isAllowedOrigin, clientIp } from '@/lib/http';

describe('isAllowedOrigin', () => {
  it('allows the apex and www production domains', () => {
    expect(isAllowedOrigin('https://agenticengineering.nl')).toBe(true);
    expect(isAllowedOrigin('https://www.agenticengineering.nl')).toBe(true);
  });
  it('allows vercel preview domains and localhost', () => {
    expect(isAllowedOrigin('https://agenticengineering-git-foo.vercel.app')).toBe(true);
    expect(isAllowedOrigin('http://localhost:3000')).toBe(true);
  });
  it('rejects foreign and null origins', () => {
    expect(isAllowedOrigin('https://evil.example')).toBe(false);
    expect(isAllowedOrigin(null)).toBe(false);
  });
});

describe('clientIp', () => {
  it('prefers x-real-ip, then last x-forwarded-for, else 0.0.0.0', () => {
    const real = new Request('https://x', { headers: { 'x-real-ip': '1.2.3.4' } });
    expect(clientIp(real)).toBe('1.2.3.4');
    const fwd = new Request('https://x', { headers: { 'x-forwarded-for': '9.9.9.9, 8.8.8.8' } });
    expect(clientIp(fwd)).toBe('8.8.8.8');
    expect(clientIp(new Request('https://x'))).toBe('0.0.0.0');
  });
});
