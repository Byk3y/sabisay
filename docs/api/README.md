# SabiSay API Documentation

## Overview

SabiSay uses a combination of on-chain data and IPFS for market information. All data is read directly from the blockchain using viem/wagmi.

## Contract Addresses

### Polygon Amoy Testnet
- **Factory**: `TBD`
- **USDC**: `TBD`

### Polygon Mainnet
- **Factory**: `TBD`
- **USDC**: `TBD`

## SDK Methods

### Markets

```typescript
// Get all markets
const { markets, isLoading, error } = useMarkets();

// Get market by ID
const market = await getMarket(marketId);
```

### Trading

```typescript
// Trade Yes/No shares
const { trade, isLoading, error } = useTrade();

await trade({
  marketId: "0x...",
  side: "yes", // or "no"
  amount: 1000000, // $1 USDC (6 decimals)
  slippage: 1, // 1%
  deadline: 1800 // 30 minutes
});

// Cashout shares
const { cashout, isLoading, error } = useCashout();

await cashout({
  marketId: "0x...",
  side: "yes",
  shares: 1000000,
  minAmount: 500000 // minimum USDC to receive
});
```

### Resolution

```typescript
// Resolve market (admin only)
const { resolve, isLoading, error } = useResolve();

await resolve({
  marketId: "0x...",
  outcome: true, // true for Yes, false for No
  evidenceCid: "Qm...", // IPFS CID with evidence
  sourceUrls: ["https://..."] // source URLs
});
```

## Events

### Market Events

- `MarketCreated(address indexed market, address indexed creator, string question, uint256 endTime, uint256 initialLiquidity)`
- `Traded(address indexed user, uint256 side, uint256 amount, uint256 shares, uint256 price)`
- `Cashout(address indexed user, uint256 side, uint256 shares, uint256 amount)`
- `PreliminaryResult(bool outcome, string resolutionCid)`
- `Disputed(address indexed disputer, string reason)`
- `Finalized(bool outcome, string resolutionCid)`
- `Redeemed(address indexed user, uint256 amount)`

## IPFS Schema

### Market Metadata

```json
{
  "question": "Will Nigeria win the next AFCON?",
  "description": "Full description of the market",
  "category": "sports",
  "close_time_utc": "2024-02-25T17:00:00Z",
  "resolution": {
    "primary_source": "CAF Official Website",
    "backup_sources": ["BBC Sport", "ESPN"],
    "invalid_conditions": ["postponed > 30 days", "cancelled"]
  }
}
```

### Resolution Evidence

```json
{
  "outcome": true,
  "source_urls": ["https://cafonline.com/..."],
  "note": "Official CAF announcement",
  "screenshots": ["bafy..."],
  "posted_at": "2024-02-26T10:14:00Z"
}
```

## Error Handling

All SDK methods return standardized error objects:

```typescript
interface Error {
  code: string;
  message: string;
  details?: any;
}
```

Common error codes:
- `INSUFFICIENT_BALANCE`
- `MARKET_CLOSED`
- `SLIPPAGE_TOO_HIGH`
- `INVALID_MARKET`
- `UNAUTHORIZED`
