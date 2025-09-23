export interface MarketOutcome {
  label: string;
  oddsPct: number;
}

export interface Market {
  id: string;
  question: string;
  outcomes: MarketOutcome[];
  poolUsd: number;
  imageUrl?: string;
  closesAt?: string;
}

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
  },
  {
    id: "2",
    question: "New York City Mayoral Election",
    outcomes: [
      { label: "Zohran Mamdani", oddsPct: 82 },
      { label: "Andrew Cuomo", oddsPct: 17 }
    ],
    poolUsd: 70000000, // $70m
    closesAt: "2024-11-05T20:00:00Z"
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
  },
  {
    id: "5",
    question: "Bitcoin price above $100k by end of 2024?",
    outcomes: [
      { label: "Yes", oddsPct: 35 },
      { label: "No", oddsPct: 65 }
    ],
    poolUsd: 45000000, // $45m
    closesAt: "2024-12-31T23:59:59Z"
  },
  {
    id: "7",
    question: "Tesla stock above $300 by Q4 2024?",
    outcomes: [
      { label: "Yes", oddsPct: 28 },
      { label: "No", oddsPct: 72 }
    ],
    poolUsd: 8500000, // $8.5m
    closesAt: "2024-12-31T23:59:59Z"
  },
  {
    id: "8",
    question: "Nigerian Naira to USD exchange rate below 1000 by year end?",
    outcomes: [
      { label: "Yes", oddsPct: 15 },
      { label: "No", oddsPct: 85 }
    ],
    poolUsd: 3200000, // $3.2m
    closesAt: "2024-12-31T23:59:59Z"
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
