import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/session';
import { logoutRateLimit, createRateLimitResponse } from '@/lib/rate-limit';
import { validateCSRF } from '@/lib/csrf';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = logoutRateLimit(request);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, {
        windowMs: 60 * 1000,
        maxRequests: 20,
      });
    }

    // Validate CSRF token
    const csrfError = await validateCSRF(request);
    if (csrfError) {
      return csrfError;
    }

    // Properly destroy the session
    await destroySession();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
