import { NextRequest, NextResponse } from 'next/server';
import { getSession, verifyCSRFToken } from './session';

/**
 * Validates CSRF token from request against session token
 * @param request Next.js request object
 * @returns NextResponse with error if validation fails, null if successful
 */
export async function validateCSRF(
  request: NextRequest
): Promise<NextResponse | null> {
  try {
    // Get session
    const session = await getSession();

    // Check if user is logged in
    if (!session.isLoggedIn || !session.csrfToken) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get CSRF token from request header
    const requestToken = request.headers.get('x-csrf-token');

    if (!requestToken) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      );
    }

    // Verify CSRF token
    const isValid = verifyCSRFToken(session.csrfToken, requestToken);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    // Validation successful
    return null;
  } catch (error) {
    console.error('CSRF validation error:', error);
    return NextResponse.json(
      { error: 'CSRF validation failed' },
      { status: 500 }
    );
  }
}
