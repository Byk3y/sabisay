# PakoMarket Web App

A Next.js application for prediction markets, inspired by Polymarket's design.

## Features

- **Dark Theme**: Matches Polymarket's visual design
- **Mobile-First**: Responsive design optimized for mobile devices
- **Market Cards**: Display prediction markets with Yes/No options
- **Category Filtering**: Trending, Breaking, New, Politics, Economy, Naija Picks
- **Search Functionality**: Search through available markets
- **Mock Data**: Currently uses mock data (contracts integration pending)

## Components

- `TopNav`: Brand logo, authentication buttons
- `CategoryTabs`: Horizontal scrolling category filter
- `MarketCard`: Individual market display with outcomes and actions
- `BottomNav`: Bottom navigation with Home, Search, Breaking, More

## Mock Data

The app currently uses mock data defined in `src/lib/mock.ts` with 8 sample markets covering:

- Federal Reserve decisions
- Political elections
- Cryptocurrency predictions
- Nigerian-specific events

## Development

```bash
pnpm dev
```

The app will be available at http://localhost:3000

## TODO

- [ ] Integrate with PakoMarket smart contracts
- [ ] Add wallet connection
- [ ] Implement actual market interactions
- [ ] Add user authentication
- [ ] Add market creation functionality
