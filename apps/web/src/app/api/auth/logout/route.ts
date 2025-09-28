import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/session';

export async function POST() {
  try {
    // Properly destroy the session
    await destroySession();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
