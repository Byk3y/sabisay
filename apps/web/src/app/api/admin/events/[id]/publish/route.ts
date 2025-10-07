import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';
import { clientEnv } from '@/lib/env.client';
import {
  createPublicClient,
  createWalletClient,
  http,
  parseUnits,
  decodeEventLog,
} from 'viem';
import { polygonAmoy } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { serverEnv } from '@/lib/env.server';
import { validateCSRF } from '@/lib/csrf';

// ABI for MarketFactory
const FACTORY_ABI = [
  {
    inputs: [
      { name: 'feeBps', type: 'uint16' },
      { name: 'endTimeUTC', type: 'uint64' },
      { name: 'rulesCid', type: 'string' },
      { name: 'initialYes', type: 'uint256' },
      { name: 'initialNo', type: 'uint256' },
    ],
    name: 'createMarket',
    outputs: [{ name: 'market', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'marketId', type: 'uint256' },
      { indexed: true, name: 'market', type: 'address' },
      { indexed: false, name: 'endTime', type: 'uint256' },
      { indexed: false, name: 'feeBps', type: 'uint256' },
      { indexed: false, name: 'rulesCid', type: 'string' },
      { indexed: false, name: 'initialYes', type: 'uint256' },
      { indexed: false, name: 'initialNo', type: 'uint256' },
    ],
    name: 'MarketCreated',
    type: 'event',
  },
] as const;

// ABI for ERC20 approve
const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session and verify admin
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Validate CSRF token
    const csrfError = await validateCSRF(request);
    if (csrfError) {
      return csrfError;
    }

    // Check admin status
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

    const eventId = params.id;

    // Fetch event from database
    const { data: event, error: fetchError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (fetchError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Fetch outcomes from event_outcomes table
    const { data: outcomesData, error: outcomesError } = await supabaseAdmin
      .from('event_outcomes')
      .select('label, idx, color')
      .eq('event_id', eventId)
      .order('idx', { ascending: true });

    if (outcomesError || !outcomesData) {
      return NextResponse.json(
        { error: 'Failed to fetch outcomes' },
        { status: 500 }
      );
    }

    const outcomes = outcomesData;

    // Preflight validation
    if (!event.question || !event.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate outcomes
    if (!outcomes || outcomes.length < 2) {
      return NextResponse.json(
        { error: 'Minimum 2 outcomes required' },
        { status: 400 }
      );
    }

    if (event.type === 'binary' && outcomes.length !== 2) {
      return NextResponse.json(
        { error: 'Binary markets must have exactly 2 outcomes' },
        { status: 400 }
      );
    }

    if (
      event.type === 'multi' &&
      (outcomes.length < 2 || outcomes.length > 8)
    ) {
      return NextResponse.json(
        { error: 'Multi-choice markets must have 2-8 outcomes' },
        { status: 400 }
      );
    }

    // Validate close time
    const closeTime = new Date(event.close_time);
    if (closeTime <= new Date()) {
      return NextResponse.json(
        { error: 'Close time must be in the future' },
        { status: 400 }
      );
    }

    // Check for image (optional but warn if missing)
    if (!event.image_url) {
      console.warn(`Event ${eventId} publishing without image`);
    }

    // Get contract addresses from env
    const factoryAddress = clientEnv.NEXT_PUBLIC_FACTORY_ADDRESS;
    const usdcAddress = clientEnv.NEXT_PUBLIC_USDC_ADDRESS;

    if (!factoryAddress || !usdcAddress) {
      return NextResponse.json(
        { error: 'Contract addresses not configured' },
        { status: 500 }
      );
    }

    // Create viem clients
    const publicClient = createPublicClient({
      chain: polygonAmoy,
      transport: http(clientEnv.NEXT_PUBLIC_RPC_URL),
    });

    const account = privateKeyToAccount(serverEnv.PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: polygonAmoy,
      transport: http(clientEnv.NEXT_PUBLIC_RPC_URL),
    });

    // Check USDC balance (use 6 decimals for USDC)
    const initialYes = parseUnits('100', 6); // 100 USDC
    const initialNo = parseUnits('100', 6); // 100 USDC
    const totalRequired = initialYes + initialNo;

    const balance = await publicClient.readContract({
      address: usdcAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [account.address],
    });

    if (balance < totalRequired) {
      return NextResponse.json(
        {
          error: 'Insufficient USDC balance',
          details: `Required: ${totalRequired / BigInt(1e6)} USDC, Available: ${balance / BigInt(1e6)} USDC`,
        },
        { status: 400 }
      );
    }

    // Check USDC allowance
    const allowance = await publicClient.readContract({
      address: usdcAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [account.address, factoryAddress as `0x${string}`],
    });

    // Approve if needed
    if (allowance < totalRequired) {
      const approveHash = await walletClient.writeContract({
        address: usdcAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [factoryAddress as `0x${string}`, totalRequired],
      });

      // Wait for approval transaction with timeout (5 minutes)
      await publicClient.waitForTransactionReceipt({
        hash: approveHash,
        timeout: 300_000, // 5 minutes
      });
    }

    // Prepare market parameters
    const feeBps = event.fee_bps ?? 200; // Default 2%
    const endTimeUTC = Math.floor(closeTime.getTime() / 1000); // Convert to Unix timestamp
    const rulesCid = event.rules || 'QmDefault'; // Use IPFS CID or placeholder

    // Estimate gas for market creation
    let gas: bigint;
    try {
      gas = await publicClient.estimateContractGas({
        address: factoryAddress as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: 'createMarket',
        args: [feeBps, BigInt(endTimeUTC), rulesCid, initialYes, initialNo],
        account: walletClient.account,
      });
      // Add 20% buffer for safety
      gas = (gas * 120n) / 100n;
    } catch (error) {
      console.error('Gas estimation failed, using fallback:', error);
      gas = 500_000n; // Fallback gas limit
    }

    // Create market on-chain with estimated gas
    const txHash = await walletClient.writeContract({
      address: factoryAddress as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: 'createMarket',
      args: [feeBps, BigInt(endTimeUTC), rulesCid, initialYes, initialNo],
      gas,
    });

    // Wait for transaction and get receipt with timeout (5 minutes)
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: 300_000, // 5 minutes
    });

    // Extract market address from event logs by decoding MarketCreated event
    let marketAddress: string | null = null;

    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: FACTORY_ABI,
          data: log.data,
          topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
        });

        if (decoded.eventName === 'MarketCreated') {
          marketAddress = decoded.args.market;
          break;
        }
      } catch {
        // Not a MarketCreated event or decoding failed, continue
        continue;
      }
    }

    if (!marketAddress) {
      console.error('MarketCreated event not found in transaction logs');
      return NextResponse.json(
        { error: 'Failed to extract market address from transaction' },
        { status: 500 }
      );
    }

    // Update database with on-chain details
    const { error: updateError } = await supabaseAdmin
      .from('events')
      .update({
        status: 'live',
        market_address: marketAddress,
        tx_hash: txHash,
      })
      .eq('id', eventId);

    if (updateError) {
      console.error('Failed to update event:', updateError);
      return NextResponse.json(
        { error: 'Failed to update event status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      slug: event.slug,
      marketAddress,
      txHash,
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
