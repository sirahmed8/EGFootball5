import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory sliding-window store for API rate limiting
const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired buckets periodically
const CLEANUP_INTERVAL = 60 * 1000;
let lastCleanup = Date.now();

function purgeExpiredRateLimits() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Strict Rate Limiter for Next.js API Routes.
 * Returns true if request is allowed, false if rate exceeded.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 20,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetInMs: number } {
  purgeExpiredRateLimits();

  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetInMs: windowMs };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetInMs: Math.max(0, record.resetAt - now),
  };
}

/**
 * Validates request Origin against platform allowed domains.
 */
const ALLOWED_ORIGINS = [
  'https://egfootball5.web.app',
  'https://football1fc1.firebaseapp.com',
  'http://localhost:3000',
  'http://localhost:3002',
];

export function getClientIp(req: NextRequest): string {
  const xForwarded = req.headers.get('x-forwarded-for');
  if (xForwarded) {
    const first = xForwarded.split(',')[0].trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip') || 'unknown-client';
}

export function validateOriginAndCors(req: NextRequest): {
  isAllowed: boolean;
  corsHeaders: Record<string, string>;
} {
  const origin = req.headers.get('origin') || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const permitted: boolean = Boolean(
    !origin ||
    ALLOWED_ORIGINS.includes(origin) ||
    (appUrl && origin === new URL(appUrl).origin)
  );

  const matchedOrigin = permitted && origin ? origin : ALLOWED_ORIGINS[0];

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': matchedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };

  return { isAllowed: permitted, corsHeaders };
}

/**
 * Standard CORS preflight response for OPTIONS requests.
 */
export function handleCorsPreflight(req: NextRequest): NextResponse {
  const { corsHeaders } = validateOriginAndCors(req);
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
