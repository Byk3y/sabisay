export interface MarketOutcome {
  label: string;
  oddsPct: number;
}

// DEPRECATED: Use Market interface from @/types/market instead
// This interface is kept for backward compatibility with existing mock data
export interface RawMarket {
  id: string;
  question: string;
  outcomes: MarketOutcome[];
  poolUsd: number;
  imageUrl?: string;
  closesAt?: string;
  uiStyle?: "default" | "binary" | "chance"; // Add uiStyle field for binary/chance markets
}

// Alias for backward compatibility - use RawMarket instead
export type Market = RawMarket;

export const mockMarkets: Market[] = [
  {
    id: "6",
    question: "Nigerian Presidential Election 2027",
    outcomes: [
      { label: "Peter Obi", oddsPct: 45 },
      { label: "Bola Tinubu", oddsPct: 38 }
    ],
    poolUsd: 12000000, // $12m
    closesAt: "2027-02-25T14:00:00Z"
    // No uiStyle - this is a multi-outcome election market
  },
  {
    id: "1",
    question: "Fed decision in September?",
    outcomes: [
      { label: "50+ bps decrease", oddsPct: 7 },
      { label: "25 bps decrease", oddsPct: 91 }
    ],
    poolUsd: 125000000, // $125m
    closesAt: "2024-09-15T14:00:00Z"
    // No uiStyle - this is a multi-outcome policy decision market
  },
  {
    id: "nyc-mayor-2025",
    question: "NYC Mayor 2025",
    outcomes: [
      { label: "Zohran Mamdani", oddsPct: 38 },
      { label: "Andrew Cuomo", oddsPct: 42 },
      { label: "Eric Adams", oddsPct: 25 },
      { label: "Curtis Sliwa", oddsPct: 15 },
      { label: "Other", oddsPct: 5 }
    ],
    poolUsd: 1450000, // $1.45m total pool
    closesAt: "2025-11-04T20:00:00Z"
    // No uiStyle - this is a group market with 5+ outcomes
  },
  {
    id: "3",
    question: "What will Powell say during September Press Conference?",
    outcomes: [
      { label: "Inflation 40+ times", oddsPct: 83 },
      { label: "Unemployment / Employment 20+...", oddsPct: 90 }
    ],
    poolUsd: 178000, // $178k
    closesAt: "2024-09-15T15:30:00Z"
    // No uiStyle - this is a multi-outcome prediction market
  },
  {
    id: "4",
    question: "Super Bowl Champion 2026",
    outcomes: [
      { label: "Kansas City Chiefs", oddsPct: 25 },
      { label: "Buffalo Bills", oddsPct: 18 }
    ],
    poolUsd: 2500000, // $2.5m
    closesAt: "2026-02-08T18:30:00Z"
    // No uiStyle - this is a multi-outcome sports market
  },
  {
    id: "5",
    question: "Bitcoin price above $100k by end of 2024?",
    outcomes: [
      { label: "Yes", oddsPct: 35 },
      { label: "No", oddsPct: 65 }
    ],
    poolUsd: 45000000, // $45m
    closesAt: "2024-12-31T23:59:59Z",
    uiStyle: "binary" // Binary market with 2 outcomes
  },
  {
    id: "7",
    question: "Tesla stock above $300 by Q4 2024?",
    outcomes: [
      { label: "Yes", oddsPct: 28 },
      { label: "No", oddsPct: 72 }
    ],
    poolUsd: 8500000, // $8.5m
    closesAt: "2024-12-31T23:59:59Z",
    uiStyle: "binary" // Binary market with 2 outcomes
  },
  {
    id: "8",
    question: "Nigerian Naira to USD exchange rate below 1000 by year end?",
    outcomes: [
      { label: "Yes", oddsPct: 15 },
      { label: "No", oddsPct: 85 }
    ],
    poolUsd: 3200000, // $3.2m
    closesAt: "2024-12-31T23:59:59Z",
    uiStyle: "binary" // Binary market with 2 outcomes
  }
];

export const categories = [
  "Trending",
  "Politics",
  "Breaking", 
  "New",
  "Sports",
  "Crypto",
  "Earnings",
  "Geopolitics",
  "Tech",
  "Culture",
  "World",
  "Economy",
  "Naija Picks"
] as const;

export type Category = typeof categories[number];

// Helper function to format pool amounts
export function formatPoolAmount(amountUsd: number): string {
  if (amountUsd >= 1000000000) {
    return `$${(amountUsd / 1000000000).toFixed(1)}b`;
  } else if (amountUsd >= 1000000) {
    return `$${(amountUsd / 1000000).toFixed(0)}m`;
  } else if (amountUsd >= 1000) {
    return `$${(amountUsd / 1000).toFixed(0)}k`;
  } else {
    return `$${amountUsd}`;
  }
}

// New formatPool utility for Polymarket-style formatting
export const formatPool = (n: number) => 
  n >= 1e9 ? `$${(n / 1e9).toFixed(1)}b` : 
  n >= 1e6 ? `$${Math.round(n / 1e6)}m` : 
  n >= 1e3 ? `$${Math.round(n / 1e3)}k` : 
  `$${n}`;

// Import the new market types for the discriminated union
import type { MarketItem } from "@/types/market";

// New market examples for chance and group markets
export const extraFeedItems: MarketItem[] = [
  {
    kind: "market",
    id: "chance-001",
    question: "Will ETH be above $3,500 on Mar 31?",
    poolUsd: 1250000,
    closesAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
    uiStyle: "binary",
    outcomes: [{ label: "Yes", oddsPct: 62.5 }], // single yes-prob reference; buy/sell yes/no on detail page
  },
  // NYC Mayor 2025 is now a single legacy market in mockMarkets, not a group
];

// Binary markets referenced by the group - COMMENTED OUT since NYC Mayor is now a single legacy market
// export const binaryMembers: MarketItem[] = [
//   {
//     kind: "market",
//     id: "mkt-nyc-mamdani",
//     question: "Zohran Mamdani to win NYC Mayor 2025?",
//     poolUsd: 450000,
//     outcomes: [{ label: "Yes", oddsPct: 38 }, { label: "No", oddsPct: 62 }],
//   },
//   {
//     kind: "market",
//     id: "mkt-nyc-cuomo",
//     question: "Andrew Cuomo to win NYC Mayor 2025?",
//     poolUsd: 520000,
//     outcomes: [{ label: "Yes", oddsPct: 42 }, { label: "No", oddsPct: 58 }],
//   },
//   {
//     kind: "market",
//     id: "mkt-nyc-adams",
//     question: "Eric Adams to win NYC Mayor 2025?",
//     poolUsd: 300000,
//     outcomes: [{ label: "Yes", oddsPct: 25 }, { label: "No", oddsPct: 75 }],
//   },
//   {
//     kind: "market",
//     id: "mkt-nyc-sliwa",
//     question: "Curtis Sliwa to win NYC Mayor 2025?",
//     poolUsd: 180000,
//     outcomes: [{ label: "Yes", oddsPct: 15 }, { label: "No", oddsPct: 85 }],
//   },
// ];

// Empty array for now since NYC Mayor is a single legacy market
export const binaryMembers: MarketItem[] = [];
