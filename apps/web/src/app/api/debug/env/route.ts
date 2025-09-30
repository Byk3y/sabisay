import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { serverEnv } from '@/lib/env.server';

export async function GET() {
  // Production guard - disable debug endpoints in production
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not Found', { status: 404 });
  }
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
}
