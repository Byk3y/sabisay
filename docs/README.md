# PakoMarket Documentation

Crypto-native prediction markets for Africa, built for Nigerian users.

## Overview

PakoMarket is a prediction market platform that allows users to stake USDC on real-world events. Inspired by Polymarket but simplified for African users, it provides a clean, mobile-first interface for betting on politics, economy, and other events.

## Architecture

- **Frontend**: Next.js 14 with Tailwind CSS and shadcn/ui
- **SDK**: TypeScript SDK with viem/wagmi integration
- **Contracts**: Solidity smart contracts on Polygon
- **Storage**: IPFS for market metadata and resolution evidence

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Project Structure

```
├── apps/web/          # Next.js frontend application
├── packages/sdk/      # TypeScript SDK for contract interaction
├── contracts/         # Solidity smart contracts
└── docs/             # Documentation and resolution logs
```

## Development

See individual package READMEs for specific development instructions:

- [Web App](./apps/web/README.md)
- [SDK](./packages/sdk/README.md)
- [Contracts](./contracts/README.md)

## Resolution Log

All market resolutions are tracked in [resolution-log.md](./resolution-log.md) with source links and evidence.

## API Documentation

API documentation is available in [api/](./api/) directory.

## Contributing

Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting PRs.

## License

MIT License - see [LICENSE](./LICENSE) for details.
