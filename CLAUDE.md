# 🛡️ PakoMarket - Claude Code Instructions

This file contains specific instructions for Claude Code when working on the PakoMarket prediction market platform.

## Project Overview
PakoMarket is a crypto-native prediction market platform for Africa built as a TypeScript monorepo targeting Polygon Amoy testnet.

## Architecture & Structure
- **Monorepo**: `/apps/web` (Next.js), `/packages/sdk` (TypeScript), `/contracts` (Solidity/Foundry), `/docs`
- **Target Network**: Polygon Amoy testnet (Chain ID: 80002)
- **Tech Stack**: Next.js 14, Tailwind CSS, viem/wagmi, Foundry, OpenZeppelin

## 🔒 Security-First Development Rules

### Golden Principles
- **ALWAYS** prioritize security in all design and code decisions
- **NEVER** commit secrets, private keys, or sensitive information
- Prefer clarity and maintainability over micro-optimizations
- Keep modules small and self-explanatory (max 200 lines for components, 600 for contracts)

### Environment & Configuration
- Use `.env.local` for secrets; validate with zod schemas on startup
- Load contract addresses from centralized config (`lib/config.ts`, `sdk/addresses.ts`)
- **NEVER** hardcode addresses or keys in components
- Only expose client-safe variables with `NEXT_PUBLIC_` prefix

### Smart Contracts (`/contracts/src/`)
- **MUST** use OpenZeppelin security primitives (`AccessControl`, `ReentrancyGuard`, `Pausable`)
- Enforce state machine: `Open → PendingResolution → DisputeWindow → Resolved | Invalid`
- Implement minimum stake ($1 USDC), slippage protection, and deadline checks
- Use multisig (2-of-3) for `RESOLVER_ROLE` and `PAUSER_ROLE`
- Store IPFS CIDs for resolution evidence on-chain
- **NEVER** allow trades after market close time
- **NEVER** use upgradeable proxies in MVP (versioned deployments only)

### SDK Development (`/packages/sdk/`)
- Expose typed hooks: `useMarkets`, `useTrade`, `useCashout`, `useResolve`
- Enforce slippage protection and deadline checks on every trade
- Reject transactions with mismatched chainId
- Document all exports with comprehensive JSDoc
- **NEVER** bypass input validation

### Frontend (`/apps/web/`)
- Mobile-first, responsive design using Tailwind CSS finance theme
- Use established UI patterns (Radix UI components)
- Implement proper error boundaries and loading states
- **NEVER** expose private keys or sensitive data to browser

## 🛠️ Development Commands

### Root Level
```bash
pnpm dev          # Start web app development server
pnpm build        # Build web app
pnpm test         # Run contract tests
pnpm lint         # Lint all packages
pnpm typecheck    # Type check all packages
```

### Contracts (`/contracts/`)
```bash
forge build      # Compile contracts
forge test        # Run tests
forge test -vvv   # Run tests with verbose output
```

### Web App (`/apps/web/`)
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm typecheck    # Type check
```

## 🎯 Current Implementation Status

### ✅ Completed
- Smart contracts with CPMM implementation
- Frontend UI with mock data
- Project structure and tooling
- Security-focused architecture

### 🔄 In Progress / Pending
- SDK hook implementations (currently placeholders)
- Contract deployment to Polygon Amoy
- Web3 wallet integration
- IPFS metadata handling
- Multisig setup for governance roles

## 📝 Development Guidelines

### When Adding New Features
1. **Always** start by reading existing code patterns
2. Follow the established architecture (UI → SDK → Contracts)
3. Implement comprehensive error handling
4. Add TypeScript types for all new interfaces
5. Write tests for contract changes
6. Update this documentation if adding new commands or patterns

### Code Style
- Use existing libraries (Radix UI, Tailwind utilities)
- Follow established naming conventions
- Prefer composition over inheritance
- Keep functions pure and testable
- Use descriptive variable names

### Security Checklist
- [ ] No hardcoded addresses or secrets
- [ ] Input validation on all user inputs
- [ ] Slippage protection on trades
- [ ] Deadline checks on time-sensitive operations
- [ ] Access control on administrative functions
- [ ] Reentrancy protection on state changes

## 🚨 Never Do
- Commit API keys, private keys, or secrets
- Bypass input validation or security checks
- Use upgradeable contracts in production
- Allow trades after market close time
- Hardcode contract addresses in components
- Create "god files" with excessive complexity

## 📚 Key Files to Reference
- `.cursorrules` - Complete development rules
- `contracts/src/Market.sol` - Core market logic
- `apps/web/src/app/page.tsx` - Main UI patterns
- `packages/sdk/src/hooks/` - SDK hook structure
- `apps/web/.env.local` - Environment configuration

Remember: **Security comes first**, followed by clean, maintainable code.