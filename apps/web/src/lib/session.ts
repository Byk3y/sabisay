import { IronSession, getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { env } from './env';

// Session data interface
export interface SessionData {
  userId?: string;
  email?: string;
  isLoggedIn: boolean;
}

// Session configuration
const sessionConfig = {
  password: env.IRON_SESSION_PASSWORD,
  cookieName: 'pakomarket-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

// Get session helper
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore as any, sessionConfig);
}

// Session type for use in API routes
export type Session = IronSession<SessionData>;
