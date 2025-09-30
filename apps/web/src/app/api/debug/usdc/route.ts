import { NextResponse } from 'next/server';
import { createPublicClient, http, formatUnits } from 'viem';
import { polygonAmoy } from 'viem/chains';
import { env } from '@/lib/env';
import { serverEnv } from '@/lib/env.server';

// USDC ABI (minimal for balance and allowance)
const USDC_ABI = [
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
] as const;

export async function GET() {
  // Production guard - disable debug endpoints in production
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not Found', { status: 404 });
  }

  try {
    const publicClient = createPublicClient({
      chain: polygonAmoy,
      transport: http(env.NEXT_PUBLIC_RPC_URL),
    });

    // Get the admin account address (from private key)
    const { privateKeyToAccount } = await import('viem/accounts');
    const account = privateKeyToAccount(serverEnv.PRIVATE_KEY as `0x${string}`);
    const adminAddress = account.address;

    // Get USDC contract address
    const usdcAddress = env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;
    const factoryAddress = env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;

    // Get USDC balance
    const balance = await publicClient.readContract({
      address: usdcAddress,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [adminAddress],
    });

    // Get allowance for factory contract
    const allowance = await publicClient.readContract({
      address: usdcAddress,
      abi: USDC_ABI,
      functionName: 'allowance',
      args: [adminAddress, factoryAddress],
    });

    // Get decimals
    const decimals = await publicClient.readContract({
      address: usdcAddress,
      abi: USDC_ABI,
      functionName: 'decimals',
    });

    const balanceFormatted = formatUnits(balance, decimals);
    const allowanceFormatted = formatUnits(allowance, decimals);

    return NextResponse.json({
      adminAddress,
      usdcAddress,
      factoryAddress,
      balance: balanceFormatted,
      allowance: allowanceFormatted,
      balanceWei: balance.toString(),
      allowanceWei: allowance.toString(),
      decimals: decimals.toString(),
    });
  } catch (error) {
    console.error('USDC debug error:', error);
    return NextResponse.json(
      { error: 'Failed to check USDC status' },
      { status: 500 }
    );
  }
}
