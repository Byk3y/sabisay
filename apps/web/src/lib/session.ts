import { IronSession, getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { serverEnv } from './env.server';
import { randomBytes } from 'crypto';

// Session data interface
export interface SessionData {
  userId?: string;
  email?: string;
  isLoggedIn: boolean;
  csrfToken?: string;
  sessionVersion?: number; // For session rotation
}

// Session configuration
const sessionConfig = {
  password: serverEnv.IRON_SESSION_PASSWORD,
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

// Generate CSRF token
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

// Verify CSRF token
export function verifyCSRFToken(
  sessionToken: string,
  requestToken: string
): boolean {
  return Boolean(sessionToken && requestToken && sessionToken === requestToken);
}

// Create secure session with CSRF protection
export async function createSecureSession(
  userId: string,
  email: string
): Promise<void> {
  const session = await getSession();

  session.userId = userId;
  session.email = email;
  session.isLoggedIn = true;
  session.csrfToken = generateCSRFToken();
  session.sessionVersion = 1; // Initial version

  await session.save();
}

// Rotate session (regenerate session ID and CSRF token)
export async function rotateSession(): Promise<void> {
  const session = await getSession();

  if (session.isLoggedIn) {
    session.csrfToken = generateCSRFToken();
    session.sessionVersion = (session.sessionVersion || 0) + 1;
    await session.save();
  }
}

// Destroy session securely
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}

// Session type for use in API routes
export type Session = IronSession<SessionData>;
