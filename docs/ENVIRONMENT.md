# Environment Configuration

This document explains all environment variables used in PakoMarket and where to configure them.

## Overview

PakoMarket uses environment variables for configuration across three main areas:
- **Server-only**: Used by API routes and server-side code (never exposed to browser)
- **Public**: Exposed to browser via `NEXT_PUBLIC_` prefix
- **Deploy-only**: Used only during contract deployment

## Server-only Environment Variables (Required)

These variables are used by the server and API routes only. They are validated at startup and the app will fail fast if any are missing.

| Variable | Description | Where Used | Default in Dev |
|----------|-------------|------------|----------------|
| `MAGIC_SECRET_KEY` | Magic Link secret key for authentication | `lib/env.ts`, API routes | None (required) |
| `MAGIC_PUBLISHABLE_KEY` | Magic Link publishable key | `lib/env.ts`, API routes | None (required) |
| `IRON_SESSION_PASSWORD` | Password for Iron session encryption | `lib/env.ts`, session management | None (required) |
| `SUPABASE_URL` | Supabase project URL | `lib/env.ts`, database operations | None (required) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `lib/env.ts`, database operations | None (required) |
| `BICONOMY_API_KEY` | Biconomy API key for gasless transactions | `lib/env.ts`, transaction handling | None (required) |
| `ALCHEMY_AMOY_RPC_URL` | Alchemy RPC URL for Polygon Amoy | `lib/env.ts`, `next.config.js` | None (required) |

## Optional Server Variables

These are only required for specific operations (like contract deployment).

| Variable | Description | Where Used | Default in Dev |
|----------|-------------|------------|----------------|
| `TREASURY_ADDRESS` | Treasury address for protocol fees | `contracts/script/Deploy*.sol` | Empty string |
| `PRIVATE_KEY` | Deployer private key | `contracts/script/Deploy*.sol` | Empty string |
| `USDC_ADDRESS` | Pre-deployed USDC address | `contracts/script/Deploy*.sol` | Empty string |

## Public Environment Variables (Browser)

These variables are exposed to the browser and must start with `NEXT_PUBLIC_`.

| Variable | Description | Where Used | Default in Dev |
|----------|-------------|------------|----------------|
| `NEXT_PUBLIC_CHAIN_ID` | EVM chain ID (80002 for Amoy) | `lib/env.ts`, `next.config.js`, `lib/config.ts` | `80002` |
| `NEXT_PUBLIC_RPC_URL` | Public RPC URL for browser | `lib/env.ts`, `next.config.js`, `lib/config.ts` | `ALCHEMY_AMOY_RPC_URL` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | `lib/env.ts`, `next.config.js` | Empty string |
| `NEXT_PUBLIC_USDC_ADDRESS` | USDC token address | `lib/env.ts`, `next.config.js`, `lib/config.ts` | Empty string |
| `NEXT_PUBLIC_FACTORY_ADDRESS` | MarketFactory contract address | `lib/env.ts`, `next.config.js`, `lib/config.ts` | Empty string |

## Configuration Files

### Web App (`apps/web/.env.local`)
Contains all environment variables for local development. Copy from `apps/web/.env.local.example`.

### Root (`.env.example`)
Comprehensive template with all variables. Copy to `.env.local` for local development.

### Contracts (`contracts/.env`)
Contains deployment-specific variables:
- `ALCHEMY_AMOY_RPC_URL` — RPC URL for Foundry deploy scripts
- `PRIVATE_KEY` — Deployer EOA private key (funded with Amoy MATIC)
- `USDC_ADDRESS` — Optional: pre-deployed USDC address
- `TREASURY_ADDRESS` — Treasury address for protocol fees

## Security Notes

- **Only variables starting with `NEXT_PUBLIC_` are exposed to the browser**
- **Never add secrets with `NEXT_PUBLIC_` prefix**
- **Keep all `.env.local` files gitignored**
- **Server-only variables are validated at startup and will cause the app to fail fast if missing**
- **Use the `env` object from `lib/env.ts` instead of direct `process.env` access**

## Runtime Validation

The app includes runtime validation for all required environment variables. If any required variables are missing, the app will:
1. Log a clear error message indicating which variable is missing
2. Exit with code 1 to prevent deployment of misconfigured apps
3. Provide helpful guidance on where to set the missing variable

## Migration from Old Variables

The following variables from the previous configuration are no longer used and have been removed:
- `SENTRY_DSN` — Moved to planned/optional features
- `IPFS_GATEWAY_URL` — Moved to planned/optional features  
- `PINATA_API_KEY`, `PINATA_SECRET_KEY` — Moved to planned/optional features
- `WEB3STORAGE_TOKEN` — Moved to planned/optional features
- `ADMIN_MULTISIG_ADDRESS`, `RESOLVER_MULTISIG_ADDRESS`, `PAUSER_MULTISIG_ADDRESS` — Moved to planned/optional features

