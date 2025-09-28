import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';
import { generalRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = generalRateLimit(request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
          }
        }
      );
    }

    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch user data from Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('id', session.userId)
      .single();

    if (error) {
      console.error('User fetch error:', error);
      // Fall back to session data
      return NextResponse.json({
        userId: session.userId,
        email: session.email || '',
        isLoggedIn: true,
      });
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email || session.email || '',
      isLoggedIn: true,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Session check failed' },
      { status: 500 }
    );
  }
}
