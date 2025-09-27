# 🛡️ PakoMarket

**Crypto-native prediction markets for Africa**

PakoMarket is a prediction market platform that allows users to stake USDC on real-world events. Inspired by Polymarket but simplified for Nigerian users, it provides a clean, mobile-first interface for betting on politics, economy, and other events.

## 🎯 Features

- **Mobile-First Design** - Optimized for Nigerian users
- **Simple Betting UX** - "Back Yes/No" and "Cashout" terminology
- **USDC Staking** - Low-fee trading on Polygon
- **Transparent Resolution** - Public resolution log with sources
- **Dispute Window** - 48h period for challenging results
- **Admin Dashboard** - Multisig-controlled resolution system

## 🏗️ Architecture

```
├── apps/web/          # Next.js 14 frontend
├── packages/sdk/      # TypeScript SDK (viem/wagmi)
├── contracts/         # Solidity smart contracts
└── docs/             # Documentation & resolution log
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Foundry (for contracts)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/pakomarket.git
cd pakomarket

# Install dependencies
pnpm install

# Copy environment variables
cp env.example .env
# Edit .env with your configuration
```

### Development

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Build all packages
pnpm build

# Lint and format
pnpm lint
pnpm format
```

### Individual Package Commands

```bash
# Web app
pnpm dev --filter web
pnpm build --filter web

# SDK
pnpm build --filter sdk
pnpm typecheck --filter sdk

# Contracts
pnpm test --filter contracts
pnpm build --filter contracts
```

## 📱 Usage

### For Users

1. **Connect Wallet** - MetaMask, Trust Wallet, or WalletConnect
2. **Browse Markets** - View available prediction markets
3. **Stake USDC** - Back Yes or No on events
4. **Cashout Early** - Exit positions if odds move favorably
5. **Redeem Winnings** - Claim rewards after resolution

### For Admins

1. **Create Markets** - Set up new prediction markets
2. **Resolve Events** - Post results with evidence
3. **Handle Disputes** - Review and resolve disputes
4. **Manage Treasury** - Control platform liquidity

## 🔧 Configuration

### Environment Variables

```bash
# Network
NEXT_PUBLIC_CHAIN_ID=80002
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Contracts
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_FACTORY_ADDRESS=0x...

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

### Contract Deployment

```bash
# Deploy to Amoy testnet
cd contracts
forge script script/Deploy.s.sol --rpc-url $AMOY_RPC_URL --private-key $PRIVATE_KEY --broadcast

# Deploy to Polygon mainnet
forge script script/Deploy.s.sol --rpc-url $POLYGON_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

## 🛡️ Security

- **Multisig Resolution** - 2-of-3 multisig for critical operations
- **Reentrancy Protection** - All external calls protected
- **Slippage Guards** - Prevent MEV and sandwich attacks
- **Pause Mechanism** - Emergency stop for all operations
- **Audit Ready** - Comprehensive test coverage

## 📊 Testing

```bash
# Run all tests
pnpm test

# Contract tests with coverage
cd contracts && forge coverage

# Web app tests
pnpm test --filter web
```

## 🚀 Deployment

### Web App (Vercel)

The web app is automatically deployed to Vercel on push to main branch.

### Contracts

Contracts are deployed via GitHub Actions using Foundry.

## 📚 Documentation

- [API Documentation](./docs/api/README.md)
- [Resolution Log](./docs/resolution-log.md)
- [Contributing Guidelines](./docs/CONTRIBUTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🆘 Support

- **Discord**: [Join our community](https://discord.gg/pakomarket)
- **Email**: [support@pakomarket.com](mailto:support@pakomarket.com)
- **Twitter**: [@PakoMarketApp](https://twitter.com/PakoMarketApp)

---

**Built with ❤️ for Africa**
