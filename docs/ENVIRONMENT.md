# Environment Configuration

This document explains all environment variables used in PakoMarket and where to configure them.

## Overview

PakoMarket uses environment variables for configuration across three main areas:
- **Server-only**: Used by API routes and server-side code (never exposed to browser)
- **Client-safe**: Exposed to browser via `NEXT_PUBLIC_` prefix
- **Deploy-only**: Used only during contract deployment

## Security Architecture

### Environment Variable Separation

The application enforces strict separation between server and client environment variables:

- **`src/lib/env.server.ts`**: Server-only variables with runtime validation
- **`src/lib/env.client.ts`**: Client-safe variables (NEXT_PUBLIC_* only)
- **`src/lib/env.ts`**: Main export (client-safe only for backward compatibility)

### Security Guards

- **Production Guards**: Debug endpoints (`/api/debug/*`) return 404 in production
- **ESLint Rules**: Direct `process.env` usage flagged in client components
- **Build Validation**: Prebuild script validates all environment variables
- **Runtime Validation**: Server variables validated with Zod schemas

## Server-only Environment Variables (Required)

These variables are used by the server and API routes only. They are validated at startup and the app will fail fast if any are missing.

| Variable | Description | Where Used | Validation |
|----------|-------------|------------|------------|
| `MAGIC_SECRET_KEY` | Magic Link secret key for authentication | `lib/env.server.ts`, API routes | Required, min 1 char |
| `IRON_SESSION_PASSWORD` | Password for Iron session encryption | `lib/env.server.ts`, session management | Required, min 32 chars |
| `SUPABASE_URL` | Supabase project URL | `lib/env.server.ts`, database operations | Required, valid URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `lib/env.server.ts`, database operations | Required, min 1 char |
| `PRIVATE_KEY` | Deployer private key | `lib/env.server.ts`, contract operations | Required, 64-char hex |
| `ALCHEMY_AMOY_RPC_URL` | Alchemy RPC URL for Polygon Amoy | `lib/env.server.ts`, contract operations | Optional, valid URL |

## Optional Server Variables

These are only required for specific operations.

| Variable | Description | Where Used | Validation |
|----------|-------------|------------|------------|
| `BICONOMY_API_KEY` | Biconomy API key for gasless transactions | `lib/env.server.ts`, transaction handling | Optional |
| `PINATA_API_KEY` | Pinata API key for IPFS uploads | `lib/env.server.ts`, IPFS operations | Optional |
| `PINATA_SECRET_KEY` | Pinata secret key for IPFS uploads | `lib/env.server.ts`, IPFS operations | Optional |
| `TREASURY_ADDRESS` | Treasury address for protocol fees | `lib/env.server.ts`, contract operations | Optional, 40-char hex |
| `USDC_ADDRESS` | Pre-deployed USDC address | `lib/env.server.ts`, contract operations | Optional, 40-char hex |

## Client-safe Environment Variables (Browser)

These variables are exposed to the browser and must start with `NEXT_PUBLIC_`.

| Variable | Description | Where Used | Validation |
|----------|-------------|------------|------------|
| `NODE_ENV` | Node environment (development/production) | `lib/env.client.ts`, components | Required, string |
| `NEXT_PUBLIC_CHAIN_ID` | EVM chain ID (80002 for Amoy) | `lib/env.client.ts`, wagmi config | Required, string, default: "80002" |
| `NEXT_PUBLIC_RPC_URL` | Public RPC URL for browser | `lib/env.client.ts`, wagmi config | Required, valid URL |
| `NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY` | Magic Link publishable key | `lib/env.client.ts`, auth components | Required, min 1 char |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `lib/env.client.ts`, supabase client | Required, valid URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `lib/env.client.ts`, supabase client | Required, min 1 char |
| `NEXT_PUBLIC_USDC_ADDRESS` | USDC token address | `lib/env.client.ts`, contract config | Optional, 40-char hex |
| `NEXT_PUBLIC_FACTORY_ADDRESS` | MarketFactory contract address | `lib/env.client.ts`, contract config | Optional, 40-char hex |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | `lib/env.client.ts`, wallet config | Optional |
| `NEXT_PUBLIC_IPFS_GATEWAY_URL` | IPFS gateway URL | `lib/env.client.ts`, IPFS operations | Optional, valid URL |

## Configuration Files

### Web App (`apps/web/.env.local`)
Contains all environment variables for local development. Copy from `apps/web/.env.local.example`.

### Contracts (`contracts/.env`)
Contains deployment-specific variables:
- `ALCHEMY_AMOY_RPC_URL` — RPC URL for Foundry deploy scripts
- `PRIVATE_KEY` — Deployer EOA private key (funded with Amoy MATIC)
- `USDC_ADDRESS` — Optional: pre-deployed USDC address
- `TREASURY_ADDRESS` — Treasury address for protocol fees

## Development Workflow

### Environment Variable Usage

**✅ Correct Usage:**
```typescript
// Server-side (API routes, server components)
import { serverEnv } from '@/lib/env.server';
const privateKey = serverEnv.PRIVATE_KEY;

// Client-side (components, hooks)
import { clientEnv } from '@/lib/env.client';
const rpcUrl = clientEnv.NEXT_PUBLIC_RPC_URL;

// Backward compatibility (client-safe only)
import { env } from '@/lib/env';
const chainId = env.NEXT_PUBLIC_CHAIN_ID;
```

**❌ Incorrect Usage:**
```typescript
// Direct process.env in client components (ESLint will flag this)
const privateKey = process.env.PRIVATE_KEY; // ❌ Security risk

// Server secrets in client code
const secret = env.MAGIC_SECRET_KEY; // ❌ Won't work, not exported
```

### Restart Requirements

After changing environment variables:
1. **Development**: Restart `pnpm dev` to reload environment
2. **Production**: Redeploy application to pick up new variables
3. **Build**: Run `pnpm run validate-env` to check configuration

## Security Policies

### Environment Variable Security

- **Only variables starting with `NEXT_PUBLIC_` are exposed to the browser**
- **Never add secrets with `NEXT_PUBLIC_` prefix**
- **Keep all `.env.local` files gitignored**
- **Server-only variables are validated at startup and will cause the app to fail fast if missing**
- **Use environment modules instead of direct `process.env` access**

### Production Guards

- **Debug endpoints** (`/api/debug/*`) return 404 in production
- **Environment validation** runs before every build
- **ESLint rules** prevent accidental `process.env` usage in client code

## Build Validation

The application includes comprehensive environment validation:

### Prebuild Script (`scripts/validate-env.js`)

Runs automatically before every build (`pnpm build`) and validates:
- All required server variables are present
- All required client variables are present  
- No server secrets exposed as `NEXT_PUBLIC_` variables
- Private key format is valid (64-char hex)
- RPC URL uses HTTPS (warning in development)

### Manual Validation

```bash
# Validate environment variables
pnpm run validate-env

# Check for linting issues
pnpm run lint

# Type check
pnpm run typecheck
```

### CI/CD Integration

The prebuild script will fail the build if:
1. Any required environment variables are missing
2. Server secrets are exposed as public variables
3. Environment variable formats are invalid

This prevents deployment of misconfigured applications.

## Troubleshooting

### Common Issues

**Build fails with "Missing required server variables"**
- Check that all required server variables are set in `.env.local`
- Run `pnpm run validate-env` to see which variables are missing

**ESLint error: "Direct process.env usage is not allowed"**
- Replace `process.env.VARIABLE` with `clientEnv.VARIABLE` in client components
- Import `clientEnv` from `@/lib/env.client`

**Debug endpoints return 404 in production**
- This is expected behavior for security
- Debug endpoints are automatically disabled in production

**Environment variables not loading**
- Restart the development server: `pnpm dev`
- Check that `.env.local` exists and has correct format
- Verify variable names match exactly (case-sensitive)

