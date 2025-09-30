import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';
import { toSlug } from '@/lib/slugUtils';
import { generalRateLimit, createRateLimitResponse } from '@/lib/rate-limit';
import { createWalletClient, createPublicClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { polygonAmoy } from 'viem/chains';
import { env } from '@/lib/env';
import { serverEnv } from '@/lib/env.server';

// Zod schema for request validation
const createEventSchema = z.object({
  title: z.string().min(3).max(100),
  question: z.string().min(10).max(500),
  type: z.enum(['binary', 'multi']),
  closeTime: z.string().datetime(),
  outcomes: z.array(z.object({
    label: z.string().min(1).max(50),
    color: z.string().optional(),
  })).min(2).max(8),
  imageBase64: z.string().optional(),
  description: z.string().max(2000).optional(),
  feeBps: z.number().min(0).max(1000).optional().default(200), // 2% default
});

// Factory ABI (minimal for createMarket function)
const FACTORY_ABI = [
  {
    type: 'function',
    name: 'createMarket',
    inputs: [
      { name: 'feeBps', type: 'uint16' },
      { name: 'endTimeUTC', type: 'uint64' },
      { name: 'rulesCid', type: 'string' },
      { name: 'initialYes', type: 'uint256' },
      { name: 'initialNo', type: 'uint256' },
    ],
    outputs: [{ name: 'market', type: 'address' }],
    stateMutability: 'nonpayable',
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = generalRateLimit(request);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, {
        windowMs: 60 * 1000,
        maxRequests: 10, // Lower limit for admin operations
      });
    }

    // Get session and verify admin
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check admin status
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', session.userId)
      .single();

    if (userError || !user?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createEventSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validationResult.error.issues,
      }, { status: 400 });
    }

    const { title, question, type, closeTime, outcomes, imageBase64, description, feeBps } = validationResult.data;

    // Validate outcomes based on type
    if (type === 'binary' && outcomes.length !== 2) {
      return NextResponse.json({
        error: 'Binary events must have exactly 2 outcomes',
      }, { status: 400 });
    }

    if (type === 'multi' && (outcomes.length < 2 || outcomes.length > 8)) {
      return NextResponse.json({
        error: 'Multi events must have 2-8 outcomes',
      }, { status: 400 });
    }

    // Validate close time is in the future
    const closeTimeDate = new Date(closeTime);
    if (closeTimeDate <= new Date()) {
      return NextResponse.json({
        error: 'Close time must be in the future',
      }, { status: 400 });
    }

    // Generate slug from title
    const baseSlug = toSlug(title);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (true) {
      const { data: existingEvent } = await supabaseAdmin
        .from('events')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existingEvent) break;
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Prepare contract call parameters
    const closeTimeUnix = Math.floor(closeTimeDate.getTime() / 1000);
    const rulesCid = description ? `ipfs://${description}` : 'ipfs://'; // Placeholder for now
    const initialAmount = BigInt(1e6); // 1 USDC with 6 decimals

    // Debug logging
    console.log('=== DEBUG: Environment Variables ===');
    console.log('PRIVATE_KEY type:', typeof serverEnv.PRIVATE_KEY);
    console.log('PRIVATE_KEY length:', serverEnv.PRIVATE_KEY ? serverEnv.PRIVATE_KEY.length : 0);
    console.log('PRIVATE_KEY value:', serverEnv.PRIVATE_KEY ? serverEnv.PRIVATE_KEY.substring(0, 10) + '...' : 'undefined');
    console.log('PRIVATE_KEY starts with 0x:', serverEnv.PRIVATE_KEY ? serverEnv.PRIVATE_KEY.startsWith('0x') : false);
    console.log('ALCHEMY_AMOY_RPC_URL:', serverEnv.ALCHEMY_AMOY_RPC_URL);
    console.log('=====================================');

    // Create viem clients
    const account = privateKeyToAccount(serverEnv.PRIVATE_KEY as `0x${string}`);
    
    const publicClient = createPublicClient({
      chain: polygonAmoy,
      transport: http(serverEnv.ALCHEMY_AMOY_RPC_URL),
    });

    const walletClient = createWalletClient({
      account,
      chain: polygonAmoy,
      transport: http(serverEnv.ALCHEMY_AMOY_RPC_URL),
    });

    // Check USDC balance and allowance before attempting to create market
    const usdcAddress = env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;
    const factoryAddress = env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;
    
    const usdcBalance = await publicClient.readContract({
      address: usdcAddress,
      abi: [
        {
          name: 'balanceOf',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'account', type: 'address' }],
          outputs: [{ name: 'balance', type: 'uint256' }],
        },
        {
          name: 'allowance',
          type: 'function',
          stateMutability: 'view',
          inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
          ],
          outputs: [{ name: 'allowance', type: 'uint256' }],
        },
        {
          name: 'decimals',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ name: 'decimals', type: 'uint8' }],
        },
      ],
      functionName: 'balanceOf',
      args: [account.address],
    });

    const usdcAllowance = await publicClient.readContract({
      address: usdcAddress,
      abi: [
        {
          name: 'allowance',
          type: 'function',
          stateMutability: 'view',
          inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
          ],
          outputs: [{ name: 'allowance', type: 'uint256' }],
        },
      ],
      functionName: 'allowance',
      args: [account.address, factoryAddress],
    });

    const requiredAmount = BigInt(1e6); // 1 USDC with 6 decimals
    
    if (usdcBalance < requiredAmount) {
      return NextResponse.json(
        { 
          error: 'Insufficient USDC balance',
          details: {
            currentBalance: usdcBalance.toString(),
            requiredAmount: requiredAmount.toString(),
            adminAddress: account.address,
            usdcAddress: usdcAddress,
            message: 'You need at least 1 USDC (1,000,000 units with 6 decimals) to create a market. Please get test USDC tokens from a faucet.'
          }
        },
        { status: 400 }
      );
    }

    if (usdcAllowance < requiredAmount) {
      return NextResponse.json(
        { 
          error: 'Insufficient USDC allowance',
          details: {
            currentAllowance: usdcAllowance.toString(),
            requiredAmount: requiredAmount.toString(),
            adminAddress: account.address,
            factoryAddress: factoryAddress,
            message: 'You need to approve the factory contract to spend USDC tokens. Please approve at least 1 USDC (1,000,000 units with 6 decimals).'
          }
        },
        { status: 400 }
      );
    }

    // Call factory contract
    const hash = await walletClient.writeContract({
      address: env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: 'createMarket',
      args: [
        feeBps,
        BigInt(closeTimeUnix),
        rulesCid,
        initialAmount,
        initialAmount,
      ],
    });

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    if (receipt.status !== 'success') {
      return NextResponse.json({
        error: 'Transaction failed',
      }, { status: 500 });
    }

    // Extract market address from logs (assuming it's in the first log)
    const marketAddress = receipt.logs[0]?.address || '0x0000000000000000000000000000000000000000';

    // Insert event into database
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .insert({
        slug,
        title,
        question,
        type,
        close_time: closeTime,
        chain_id: 80002,
        market_address: marketAddress,
        tx_hash: hash,
        creator_user_id: session.userId,
        status: 'live',
        image_cid: imageBase64 ? 'ipfs://placeholder' : null, // TODO: Pin to IPFS
      })
      .select('id')
      .single();

    if (eventError) {
      console.error('Failed to insert event:', eventError);
      return NextResponse.json({
        error: 'Failed to create event',
      }, { status: 500 });
    }

    // Insert event outcomes
    const outcomesData = outcomes.map((outcome, index) => ({
      event_id: event.id,
      label: outcome.label,
      idx: index,
      color: outcome.color || null,
    }));

    const { error: outcomesError } = await supabaseAdmin
      .from('event_outcomes')
      .insert(outcomesData);

    if (outcomesError) {
      console.error('Failed to insert outcomes:', outcomesError);
      // Clean up the event if outcomes failed
      await supabaseAdmin
        .from('events')
        .delete()
        .eq('id', event.id);
      
      return NextResponse.json({
        error: 'Failed to create event outcomes',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        slug,
        marketAddress,
        txHash: hash,
        eventId: event.id,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
