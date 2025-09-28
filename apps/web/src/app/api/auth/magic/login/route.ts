import { NextRequest, NextResponse } from 'next/server';
import { Magic } from '@magic-sdk/admin';
import { createSecureSession } from '@/lib/session';
import { env } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase-server';
import { authRateLimit } from '@/lib/rate-limit';

// Initialize Magic Admin
const magic = new Magic(env.MAGIC_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log('Magic login API called');

    // Apply rate limiting with error handling
    try {
      const rateLimitResult = authRateLimit(request);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: 'Too many login attempts. Please try again later.' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': '5',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
            }
          }
        );
      }
    } catch (rateLimitError) {
      console.error('Rate limiting error:', rateLimitError);
      // Continue without rate limiting if it fails
    }
    
    // Get DID token from Authorization header or request body
    let didToken: string;

    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      didToken = authHeader.substring(7);
    } else {
      const body = await request.json();
      didToken = body.didToken;
    }

    console.log('DID token received:', didToken ? 'Yes' : 'No');

    if (!didToken) {
      console.log('No DID token provided');
      return NextResponse.json(
        { error: 'DID token is required' },
        { status: 400 }
      );
    }

    console.log('Verifying DID token with Magic Admin...');
    console.log('Magic secret key configured:', env.MAGIC_SECRET_KEY ? 'Yes' : 'No');
    
    // Verify the DID token with Magic Admin
    const metadata = await magic.users.getMetadataByToken(didToken);
    console.log('Magic metadata:', metadata);

    if (!metadata || !metadata.issuer) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Extract Magic data
    const issuer = metadata.issuer; // DID (subject)
    const email = metadata.email ?? null;
    const provider = email ? 'magic-email' : 'magic-google';

    // Lookup existing identity
    const { data: identity } = await supabaseAdmin
      .from('identities')
      .select('id,user_id,provider,subject,users(email)')
      .eq('provider', provider)
      .eq('subject', issuer)
      .maybeSingle();

    let userId: string;

    if (!identity) {
      // Create new user and identity
      const { data: newUser, error: uErr } = await supabaseAdmin
        .from('users')
        .insert({ email })
        .select('id')
        .single();

      if (uErr) {
        console.error('User creation error:', uErr);
        throw uErr;
      }

      userId = newUser.id;

      const { error: iErr } = await supabaseAdmin
        .from('identities')
        .insert({ user_id: userId, provider, subject: issuer });

      if (iErr) {
        console.error('Identity creation error:', iErr);
        throw iErr;
      }
    } else {
      // Use existing user
      userId = identity.user_id;

      // Backfill email if missing
      if (email && !identity.users?.[0]?.email) {
        const { error: updateErr } = await supabaseAdmin
          .from('users')
          .update({ email })
          .eq('id', userId);

        if (updateErr) {
          console.error('Email update error:', updateErr);
          // Don't throw - this is not critical
        }
      }
    }

    // Create secure session with CSRF protection
    await createSecureSession(userId, email || '');

    // Return success
    return NextResponse.json({
      ok: true,
      userId,
      email: email || '',
    });
  } catch (error) {
    console.error('Magic login error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { error: 'Authentication failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
