import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { serverEnv } from '@/lib/env.server';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  // Production guard - disable debug endpoints in production
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Authentication guard - require admin access
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify admin status
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', session.userId)
      .single();

    if (userError || !user?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Admin authenticated - return debug info
    return NextResponse.json({
      PRIVATE_KEY: {
        type: typeof serverEnv.PRIVATE_KEY,
        length: serverEnv.PRIVATE_KEY ? serverEnv.PRIVATE_KEY.length : 0,
        value: serverEnv.PRIVATE_KEY
          ? serverEnv.PRIVATE_KEY.substring(0, 10) + '...'
          : 'undefined',
        startsWith0x: serverEnv.PRIVATE_KEY
          ? serverEnv.PRIVATE_KEY.startsWith('0x')
          : false,
      },
      ALCHEMY_AMOY_RPC_URL: serverEnv.ALCHEMY_AMOY_RPC_URL,
      NEXT_PUBLIC_RPC_URL: env.NEXT_PUBLIC_RPC_URL,
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
