/**
 * Scrapes the strike price (openPrice) for a given Polymarket crypto market.
 * Works reliably for 5-minute and 15-minute resolution markets.
 *
 * @param url The polymarket event URL
 * @returns The strike price as a number, or null if it could not be found
 */
export async function scrapeStrikePrice(url: string): Promise<number | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();

        const rx = /<script\s+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i;
        const match = html.match(rx);

        if (!match || !match[1]) {
            throw new Error('__NEXT_DATA__ script not found. The page structure might have changed.');
        }

        const scriptText = match[1];
        const nextData = JSON.parse(scriptText);

        // The relevant data is usually in props.pageProps.dehydratedState.queries
        const queries = nextData?.props?.pageProps?.dehydratedState?.queries || [];

        // Find the query that contains the crypto-prices
        const priceQuery = queries.find((q: any) => {
            const key = q.queryKey || [];
            return key.length >= 2 && key[0] === 'crypto-prices' && key[1] === 'price';
        });

        if (!priceQuery) {
            throw new Error('Could not find the crypto-prices query in the page data.');
        }

        const openPrice = priceQuery?.state?.data?.openPrice;

        if (typeof openPrice === 'number') {
            return openPrice;
        }

        throw new Error('openPrice not found in the crypto-prices query state data.');
    } catch (error) {
        console.error(`Error fetching strike price for ${url}:`, error instanceof Error ? error.message : String(error));
        return null;
    }
}

// CLI usage setup
import { fileURLToPath } from 'url';

const isMainModule = typeof process !== 'undefined' && process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
    const urlArg = process.argv[2];

    if (!urlArg) {
        console.log('Usage: npx tsx index.ts <polymarket_url>');
        console.log('Using default example url...');
    }

    const defaultUrl = 'https://polymarket.com/event/eth-updown-5m-1772602500/eth-updown-5m-1772602500';
    const targetUrl = urlArg || defaultUrl;

    console.log(`Fetching ${targetUrl}...`);

    scrapeStrikePrice(targetUrl).then(price => {
        if (price !== null) {
            console.log(`\nMarket Strike Price (Open Price): $${price}`);
            console.log(`Formatted Strike Price: $${price.toFixed(2)}\n`);
        } else {
            console.log(`\nCould not extract strike price for the provided URL.\n`);
        }
    });
}
