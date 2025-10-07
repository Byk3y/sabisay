import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { generalRateLimit, createRateLimitResponse } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = generalRateLimit(request);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, {
        windowMs: 60 * 1000,
        maxRequests: 60,
      });
    }

    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!session.csrfToken) {
      return NextResponse.json(
        { error: 'No CSRF token available' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      csrfToken: session.csrfToken,
    });
  } catch (error) {
    console.error('CSRF token fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CSRF token' },
      { status: 500 }
    );
  }
}
