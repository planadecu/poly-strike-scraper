# poly-strike-scraper

A lightweight, dependency-free Node.js package to extract the exact strike price (`openPrice`) from [Polymarket](https://polymarket.com) crypto up-down markets.

Works reliably for **5-minute, 15-minute, and 4-hour** resolution markets (markets that rely on Chainlink's data stream)

## Installation

You can install this package using `pnpm` (recommended), `npm`, or `yarn`:

```bash
pnpm add poly-strike-scraper
# or
npm install poly-strike-scraper
# or
yarn add poly-strike-scraper
```

## Usage

### As a Module

You can easily import the `scrapeStrikePrice` function into your own applications. It returns the extracted price as a `number`, or `null` if the page structure has changed or the URL is invalid.

**Note:** The Polymarket URL should be the specific market URL, which is formatted as `https://polymarket.com/event/{eventSlug}/{marketSlug}`.

```typescript
import { scrapeStrikePrice } from 'poly-strike-scraper';

async function main() {
  const url = 'https://polymarket.com/event/eth-updown-5m-1772602500/eth-updown-5m-1772602500';
  const price = await scrapeStrikePrice(url);
  
  if (price !== null) {
    console.log(`The strike price is: $${price}`);
  } else {
    console.log('Could not find the strike price.');
  }
}

main();
```

### From the Command Line

If you clone the repository or install the package globally, you can run the scraper directly from your CLI.

With `pnpm` and `tsx` installed:

```bash
# Run with the default ETH Up or Down example
pnpm start

# Run with a specific URL
pnpm start "https://polymarket.com/event/eth-updown-5m-1772602500/eth-updown-5m-1772602500"
```

## How It Works

Polymarket dynamically renders its market pages using Next.js. Rather than using a heavy headless browser or parsing libraries like `cheerio`, this scraper works by matching the JSON payload embedded in the `<script id="__NEXT_DATA__">` tag, bypassing external dependencies completely.

It parses the `React Query` hydration state and traverses it to find the exact initial `crypto-prices` payload and its embedded `openPrice` number.

## Compatibility

- ✅ **5-minute markets**
- ✅ **15-minute markets**
- ✅ **4-hour markets**
- ❌ **1-hour markets**: These markets do not embed their strike price in the page payload the same way, and instead fetch it asynchronously from an external API (like Binance) which can be geoblocked. This scraper does not currently support 1-hour resolution markets.
