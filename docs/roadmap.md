# PakoMarket Roadmap

Single source of truth for PakoMarket's Polymarket-style platform. We ship in phases; each phase is independently shippable.

---

## 🧭 Progress Overview

- [ ] **Phase 1 — Core Trading MVP**
- [ ] **Phase 2 — Advanced Trading Features**
- [ ] **Phase 3 — User Growth & Onboarding**
- [ ] **Phase 4 — Governance & Community Resolution**
- [ ] **Phase 5 — Liquidity & Pro Tools**

> Tip: Update these checkboxes only when the phase "Definition of Done" is fully met.

---

## Phase 1 — Core Trading MVP

**Goal:** Users can trade binary & multi-outcome markets with USDC on Polygon (Amoy for testnet), resolve markets (admin), and redeem winnings.

**Deliverables**
- Home feed, Market detail, Portfolio, Admin (Create/Resolve), "How it works" modal
- Contracts: MarketFactory, Market (CPMM), resolution workflow, USDC integration
- SDK: `useMarkets`, `useMarket`, `useTrade`, `useCashout`, `useResolve`, `usePortfolio`
- WalletConnect/MetaMask (Polygon Amoy)
- IPFS for rules/evidence (CID stored on-chain)

**Checklist**
- [ ] **Contracts**
  - [ ] CPMM buy/sell (binary + multi-outcome) with minOut (slippage)
  - [ ] State machine: Open → Pending → DisputeWindow (48h) → Finalized | Invalid
  - [ ] Admin: close, postPreliminary(outcome, evidenceCid), finalize, markInvalid, pause/unpause
  - [ ] Events: Trade, Close, Preliminary, Finalized, Invalidated, Redeem, FeesWithdrawn
  - [ ] Foundry tests (trading, closing, resolution, redeem, pause)
  - [x] Deploy to Amoy; commit `contracts/addresses/amoy.json`
  - [x] Deploy to local Anvil chain for development
- [ ] **SDK**
  - [x] Read markets, reserves → compute prices & chance %
  - [ ] `useTrade()` buy/sell; `useCashout()` sell all; error + receipt handling
  - [ ] `useResolve()` admin only; `usePortfolio()` balances + est. value
- [ ] **Frontend**
  - [x] Home/Feed (cards from on-chain data)
  - [ ] Market Detail: Buy/Sell panel, position card, resolution banner
  - [ ] Portfolio: open positions, redeem section
  - [ ] Admin: Create Market (IPFS rules upload), Resolve Market (prelim → timer → finalize)
  - [ ] "How it works" modal (3 steps)
- [ ] **Infra**
  - [ ] RPC (Alchemy Amoy), WalletConnect project ID, USDC address envs
  - [ ] IPFS pinning (Pinata/Web3.Storage) server route
  - [ ] Basic geo-block for restricted regions; ToS link
  - [x] Local development setup with Anvil chain
  - [x] MockUSDC deployment and configuration
  - [x] Wagmi/viem wallet integration
- [ ] **QA (manual)**
  - [ ] Buy, Sell (cash out), price moves
  - [ ] Close → Prelim → (48h) → Finalize → Redeem (winners only)
  - [ ] Pause blocks trades; Unpause restores

**Definition of Done**
- Working end-to-end: connect → trade → resolve → redeem on Amoy with USDC.
- All core screens wired to contracts (no mock data).

---

## Phase 2 — Advanced Trading Features

**Goal:** Add trader-grade controls and Polymarket-style market depth.

**Deliverables**
- Limit orders + basic order book UI
- Price/time charts (odds history)
- Advanced trade panel (Market vs Limit)
- Expanded market detail (context, related markets)

**Checklist**
- [ ] **Contracts/Matching**
  - [ ] Limit order data model (on-chain or off-chain with on-chain settlement)
  - [ ] Matching flow + events
- [ ] **SDK**
  - [ ] `placeLimit`, `cancelOrder`, `useOrderBook`, `useTrades`
- [ ] **Frontend**
  - [ ] Limit tab (price, shares, expiry)
  - [ ] Order book panel (bids/asks, depth)
  - [ ] Charts (line chart of Yes price/chance)
- [ ] **QA**
  - [ ] Partial fills, cancel, cross-trade, chart accuracy

**Definition of Done**
- Users can place/cancel limit orders, see order book, and chart updates.

---

## Phase 3 — User Growth & Onboarding

**Goal:** Smooth onboarding for non-crypto natives.

**Deliverables**
- MoonPay on-ramp for USDC
- Profile & watchlist
- Notifications (email/push) for resolution/cash-out reminders
- UX polish for sign-up/connect

**Checklist**
- [ ] MoonPay handoff & success callback
- [ ] Profile screen; watchlist (optional Supabase)
- [ ] Notification preferences & basic events
- [ ] Guided tour for first trade

**Definition of Done**
- New users can fund, understand, and place a first trade without friction.

---

## Phase 4 — Governance & Community Resolution

**Goal:** Reduce trust in admin; enable disputes.

**Deliverables**
- Dispute bonds & challenge period
- Multisig/DAO roles for resolver/pauser
- Evidence dashboard

**Checklist**
- [ ] Dispute bond contract logic
- [ ] Challenge/resolve flows, UI
- [ ] Governance surface (proposals, role changes)

**Definition of Done**
- Markets can be challenged and finalized via community-backed process.

---

## Phase 5 — Liquidity & Pro Tools

**Goal:** Scale liquidity and serve power users.

**Deliverables**
- LP dashboard (provide/withdraw liquidity, fee APR)
- Analytics (volume, fees, PnL, trends)
- Advanced filters; PWA/mobile polish

**Checklist**
- [ ] LP flows + fee accounting
- [ ] Analytics pages & API
- [ ] PWA install + performance budget

**Definition of Done**
- Sustainable liquidity growth; pro users have depth + insights.

---

## How to Update Progress

- Update checkboxes via PRs tied to commits.
- When a phase meets its **Definition of Done**, tick it in **Progress Overview** and add a note in **Changelog**.

---

## Changelog

- _2025-01-19_: Initialized roadmap.
- _2025-01-19_: **Major Frontend Progress** - Completed mobile-first UI with dark/light mode, wallet connection, market cards, and responsive navigation. Local development environment fully functional with Anvil chain and MockUSDC.

## Current Status (Phase 1)

**✅ Completed:**
- **Frontend Foundation**: Mobile-first responsive design with Polymarket-style UI
- **Theme System**: Complete dark/light mode implementation with smooth transitions
- **Wallet Integration**: MetaMask connection with local Anvil chain support
- **UI Components**: Market cards, navigation, search, filtering, and mobile drawer
- **Development Environment**: Local Anvil chain with MockUSDC deployment
- **TypeScript Setup**: Monorepo structure with proper type definitions

**🚧 In Progress:**
- **Smart Contracts**: MarketFactory deployed, individual Market contracts need implementation
- **SDK Hooks**: Basic structure ready, need trading and portfolio hooks
- **Contract Integration**: Frontend ready for real contract data integration

**📋 Next Steps:**
1. Implement individual Market contracts with CPMM logic
2. Create trading hooks in SDK
3. Build Market Detail and Portfolio screens
4. Add admin dashboard for market creation/resolution
5. Integrate IPFS for market metadata storage
