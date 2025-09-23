# Environment Configuration

This doc explains what each env var controls and where to set it.

## Web App (`apps/web/.env.local`)
- `NEXT_PUBLIC_CHAIN_ID` — EVM chain id. For Polygon Amoy testnet use `80002`.
- `NEXT_PUBLIC_RPC_URL` — Public RPC HTTP URL (e.g., Alchemy Amoy). Client-safe.
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — WalletConnect Cloud project id. Client-safe.
- `NEXT_PUBLIC_USDC_ADDRESS` — USDC (or MockUSDC) token address on Amoy. Client-safe.
- `NEXT_PUBLIC_FACTORY_ADDRESS` — MarketFactory address after deploy. Client-safe.
- `SENTRY_DSN` — Optional monitoring DSN. Keep blank if unused.
- `IPFS_GATEWAY_URL` — Public read gateway for IPFS (e.g. https://ipfs.io/ipfs/). Client-safe.

**Server-only (no NEXT_PUBLIC_):**
- `PINATA_API_KEY`, `PINATA_SECRET_KEY` — IPFS pinning keys used only by server API routes to upload rules/evidence. Never expose to client or commit.
- `WEB3STORAGE_TOKEN` (optional) — Alternative to Pinata. Keep server-only.

**Admin addresses (public OK):**
- `ADMIN_MULTISIG_ADDRESS`, `RESOLVER_MULTISIG_ADDRESS`, `PAUSER_MULTISIG_ADDRESS` — Safe multisigs controlling admin, resolver, and pauser roles.
- `TREASURY_ADDRESS` — Address that collects protocol fees (Safe or EOA).

## Contracts (`contracts/.env`)
- `AMOY_RPC_URL` — RPC URL for Foundry deploy scripts.
- `PRIVATE_KEY` — Deployer EOA private key (funded with Amoy MATIC). Never commit.
- `USDC_ADDRESS` — Optional: pre-deployed MockUSDC address if you aren't deploying a new one in the script.

## SDK (`packages/sdk/.env`) — optional
Use only if you run the SDK in a separate node process. Otherwise the web app's NEXT_PUBLIC_* covers it.
- `CHAIN_ID`, `RPC_URL`, `FACTORY_ADDRESS`, `USDC_ADDRESS`

## Security Notes
- Only variables starting with `NEXT_PUBLIC_` are exposed to the browser.
- Never add secrets with `NEXT_PUBLIC_`.
- Keep all *.env files gitignored, except the `apps/web/.env.local.example` template.
- IPFS pinning keys must stay server-only; the client only receives a CID from our API route.

