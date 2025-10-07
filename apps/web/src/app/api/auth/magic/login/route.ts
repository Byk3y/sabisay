import { NextRequest, NextResponse } from 'next/server';
import { Magic } from '@magic-sdk/admin';
import { createSecureSession } from '@/lib/session';
import { env } from '@/lib/env';
import { serverEnv } from '@/lib/env.server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { authRateLimit, createRateLimitResponse } from '@/lib/rate-limit';

// Initialize Magic Admin
const magic = new Magic(serverEnv.MAGIC_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting with error handling
    try {
      const rateLimitResult = authRateLimit(request);
      if (!rateLimitResult.allowed) {
        return createRateLimitResponse(rateLimitResult, {
          windowMs: 15 * 60 * 1000,
          maxRequests: 5,
        });
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

    if (!didToken) {
      return NextResponse.json(
        { error: 'DID token is required' },
        { status: 400 }
      );
    }

    // Verify the DID token with Magic Admin
    const metadata = await magic.users.getMetadataByToken(didToken);

    if (!metadata || !metadata.issuer) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get wallet address from Magic metadata
    let walletAddress: string;
    try {
      // The publicAddress should be available in the metadata
      const publicAddress = metadata.publicAddress;
      if (!publicAddress) {
        throw new Error('No public address found in metadata');
      }
      walletAddress = publicAddress;
    } catch (walletError) {
      console.error('Failed to get wallet address:', walletError);
      return NextResponse.json(
        { error: 'Unable to retrieve wallet address' },
        { status: 500 }
      );
    }

    // Extract Magic data
    const issuer = metadata.issuer; // DID (subject)
    const email = metadata.email ?? null;
    const provider = email ? 'magic-email' : 'magic-google';

    // Lookup existing identity
    const { data: identity } = await supabaseAdmin
      .from('identities')
      .select('id,user_id,provider,subject,users(email,username)')
      .eq('provider', provider)
      .eq('subject', issuer)
      .maybeSingle();

    let userId: string;

    if (!identity) {
      // Create new user and identity with wallet address as username
      const { data: newUser, error: uErr } = await supabaseAdmin
        .from('users')
        .insert({
          email,
          username: walletAddress,
        })
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

      // Update user data if needed
      const updateData: any = {};

      // Backfill email if missing
      if (email && !identity.users?.[0]?.email) {
        updateData.email = email;
      }

      // Set username to wallet address if not already set or if it's different
      if (
        !identity.users?.[0]?.username ||
        identity.users[0].username !== walletAddress
      ) {
        updateData.username = walletAddress;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        const { error: updateErr } = await supabaseAdmin
          .from('users')
          .update(updateData)
          .eq('id', userId);

        if (updateErr) {
          console.error('User update error:', updateErr);
          // Don't throw - this is not critical
        }
      }
    }

    // Ensure wallet is recorded in wallets table
    try {
      const chainId = parseInt(env.NEXT_PUBLIC_CHAIN_ID || '80002', 10);

      // Check if wallet already exists for this user
      const { data: existingWallet } = await supabaseAdmin
        .from('wallets')
        .select('id')
        .eq('user_id', userId)
        .eq('eoa_address', walletAddress)
        .maybeSingle();

      if (!existingWallet) {
        // Insert wallet record
        const { error: walletError } = await supabaseAdmin
          .from('wallets')
          .insert({
            user_id: userId,
            chain_id: chainId,
            eoa_address: walletAddress,
          });

        if (walletError) {
          console.error('Wallet creation error:', walletError);
          // Don't throw - this is not critical for auth
        } else {
        }
      }
    } catch (walletError) {
      console.error('Wallet recording error:', walletError);
      // Don't throw - this is not critical for auth
    }

    // Create secure session with CSRF protection
    await createSecureSession(userId, email || '');

    // Fetch user admin status for response
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();

    const isAdmin = userError ? false : userData.is_admin === true;

    // Return success
    return NextResponse.json({
      ok: true,
      userId,
      email: email || '',
      username: walletAddress,
      isAdmin,
    });
  } catch (error) {
    console.error('Magic login error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      {
        error: 'Authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
