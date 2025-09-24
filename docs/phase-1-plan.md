# Phase 1 — Core Trading MVP (Detailed Plan)

**Main Goal:**
Deliver a working end-to-end prediction market MVP where users can trade binary & multi-outcome markets with USDC on Polygon (Amoy testnet), markets can be resolved by admin, and winnings redeemed.

## 1A. Smart Contracts (Core Logic)

**Goal:** Create and test contracts for binary & multi-outcome CPMM markets.

**Plan:**
- Market contract (per market) with CPMM pricing.
- Factory contract to deploy/manage markets.
- USDC integration (ERC20).
- Role system for admin (resolver, pauser).
- Resolution workflow with preliminary → dispute window → finalize/invalid.
- Emit clear events for every key action.
- Comprehensive tests with Foundry.

**Checklist:**
- [x] MarketFactory contract (deploy new markets, track addresses).
- [ ] Market contract with:
  - [ ] CPMM buy/sell (binary + multi-outcome).
  - [ ] State machine (Open → Pending → Dispute → Finalized/Invalid).
  - [ ] Slippage checks.
  - [ ] Role-based admin functions (close, postPreliminary, finalize, markInvalid).
  - [ ] Emergency pause/unpause.
  - [ ] Events for Trade, Close, Preliminary, Finalized, Invalidated, Redeem.
- [ ] Tests: trading mechanics, slippage, resolution, redeem, invalid, pause.
- [x] Deploy to Amoy testnet, record addresses.
- [x] Deploy to local Anvil chain for development.

## 1B. SDK (TypeScript Layer)

**Goal:** Expose contracts to frontend via React hooks and utilities.

**Plan:**
- Create TypeScript SDK package with reusable functions.
- Define types for Market, Position, Trade, etc.
- Implement hooks for fetching data and performing trades.
- Add formatting & math utilities (prices, odds, payouts).

**Checklist:**
- [x] Types for Market, Outcome, Position, Trade.
- [x] Utilities: formatUSDC, oddsFromReserves, payout calculation.
- [ ] Hooks:
  - [ ] `useMarkets()` → list of markets.
  - [ ] `useMarket(id)` → single market detail.
  - [ ] `useTrade()` → buy/sell positions.
  - [ ] `useCashout()` → redeem/sell back.
  - [ ] `useResolve()` → admin resolution actions.
  - [ ] `usePortfolio()` → user balances + estimated value.

## 1C. Frontend (Next.js App)

**Goal:** Build user-facing app with key screens and connect to SDK.

**Plan:**
- Start with mock data, then replace with contract data.
- Follow Polymarket-style UI with financial dark theme.
- Optimize for mobile first.

**Checklist:**
- [x] Home/Feed screen — list markets (cards).
- [ ] Market Detail screen — buy/sell panel, odds chart placeholder, resolution banner.
- [ ] Portfolio screen — open positions, redeem button.
- [ ] Admin dashboard — create market, upload rules (IPFS), resolve market.
- [ ] "How it Works" modal — simple 3-step flow (Pick → Trade → Profit).
- [ ] Replace mock data with SDK/contract data.

**Progress Notes:**
- ✅ **Mobile-first responsive design** with Polymarket-style UI
- ✅ **Dark/Light mode** theme system implemented
- ✅ **Wallet connection** (MetaMask) with local Anvil chain support
- ✅ **Market cards** with proper styling and interaction states
- ✅ **Category filtering** and search functionality
- ✅ **Bottom navigation** and side panel for mobile
- ✅ **Top navigation** with wallet status and theme toggle
- ✅ **Mock data** structure ready for contract integration

## 1D. Infrastructure

**Goal:** Ensure reliable integrations with Polygon + storage.

**Plan:**
- Set up RPC & envs for Polygon Amoy via Alchemy.
- Integrate WalletConnect & MetaMask for user wallets.
- Use IPFS (Pinata/Web3.Storage) for rules/evidence.
- Add basic geo-block for restricted regions.
- Store USDC testnet address + contract addresses in env.

**Checklist:**
- [ ] Alchemy Amoy RPC key added.
- [ ] WalletConnect project ID configured.
- [x] USDC testnet contract address added to env.
- [ ] IPFS pinning set up with API keys.
- [ ] Simple geo-block + ToS page.

**Progress Notes:**
- ✅ **Local development setup** with Anvil chain
- ✅ **MockUSDC deployment** and configuration
- ✅ **Environment variables** properly configured
- ✅ **Wagmi/viem integration** for wallet connection
- ✅ **TypeScript configuration** and build system
- ✅ **Monorepo structure** with pnpm workspaces

## 1E. QA (Manual Testing)

**Goal:** Validate that the end-to-end flow works before shipping Phase 1.

**Checklist:**
- [ ] Trade Yes/No → price updates correctly.
- [ ] Close → preliminary outcome posted → dispute window (simulated) → finalize.
- [ ] Winners can redeem, losers cannot.
- [ ] Pause blocks trades, unpause restores.
- [ ] Check slippage protection works.
- [ ] Confirm all screens show correct on-chain data.

## Definition of Done (Phase 1)

- [ ] Users can connect wallet, buy/sell outcomes with USDC on Amoy.
- [ ] Admin can resolve markets and winners redeem.
- [ ] All core screens (Home, Market, Portfolio, Admin) wired to contracts.
- [ ] Security features (roles, slippage, pause) functional.
- [ ] IPFS evidence storage integrated.

