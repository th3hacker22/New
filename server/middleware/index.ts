/**
 * Express middleware: security headers, CORS, and a small in-memory rate limiter.
 * Kept framework-local so `server.ts` reads as wiring, not policy.
 */
import type { NextFunction, Request, Response } from 'express';

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  next();
}

const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin as string | undefined;
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev || !origin || ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*')) {
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
}

type RateLimitEntry = { count: number; resetTime: number };
const rateLimitStore = new Map<string, RateLimitEntry>();

export function createRateLimiter(opts: {
  windowMs: number;
  max: number;
  keyPrefix: string;
  message?: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      'unknown';
    const key = `${opts.keyPrefix}:${ip}:${req.path}`;
    const now = Date.now();
    let entry = rateLimitStore.get(key);
    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime: now + opts.windowMs };
    }
    entry.count += 1;
    rateLimitStore.set(key, entry);

    const remaining = Math.max(0, opts.max - entry.count);
    res.setHeader('X-RateLimit-Limit', String(opts.max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(entry.resetTime / 1000)));

    if (entry.count > opts.max) {
      res.status(429).json({
        error: opts.message || 'Too many requests, please try again later.',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
      return;
    }
    next();
  };
}

// Periodically evict stale entries.
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime + 60_000) rateLimitStore.delete(key);
      }
    },
    5 * 60 * 1000,
  ).unref?.();
}
