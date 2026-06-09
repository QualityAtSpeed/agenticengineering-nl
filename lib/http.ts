const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/(www\.)?agenticengineering\.nl$/,
  /^https:\/\/agenticengineering(-[a-z0-9-]+)?\.vercel\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
];

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin));
}

export function clientIp(req: Request): string {
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) {
    const parts = fwd
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return '0.0.0.0';
}
