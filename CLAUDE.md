# Polymarket Strike Price Scraper

This is a lightweight, dependency-free (aside from TypeScript environment) Node.js script that extracts the exact strike price (`openPrice`) from Polymarket crypto up-down markets (5-minute, 15-minute, and 4-hour resolutions).

## Commands

- **Run without arguments (uses default URL):** 
  `npm start`
- **Run with specific URL:**
  `npm start <polymarket_url>`
  (e.g., `npm start "https://polymarket.com/event/eth-updown-5m-1772602500/eth-updown-5m-1772602500"`)
- **Direct execution:**
  `npx tsx index.ts <polymarket_url>`

## Usage as a Module

You can easily import the `scrapeStrikePrice` function into other applications.

**Note:** The Polymarket URL should be the specific market URL, which is formatted as `https://polymarket.com/event/{eventSlug}/{marketSlug}`.

```typescript
import { scrapeStrikePrice } from './index';

async function main() {
  const url = 'https://polymarket.com/event/eth-updown-5m-1772602500/eth-updown-5m-1772602500';
  const price = await scrapeStrikePrice(url);
  
  if (price !== null) {
    console.log(`The strike price is: $${price}`);
  }
}
```

## How It Works

Polymarket dynamically renders pages using Next.js. The script fetches the raw HTML page payload and bypasses standard DOM parsing. Instead, it uses a simple regex string match to locate the `__NEXT_DATA__` JSON block, parses it, and then traverses the `React Query` hydration state to find the exact initial `crypto-prices` payload and its embedded `openPrice` number.

*Note: This scraper relies on the pre-fetched React UI state payload located in the `__NEXT_DATA__` tag, which works consistently across 5m, 15m, and 4h up-down markets. For 1-hour resolution markets, Polymarket handles the resolution API state slightly differently behind external providers that might block geolocations, so results may vary for 1h markets based on API routing mechanics.*
