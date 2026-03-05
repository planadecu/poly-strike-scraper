import test from 'node:test';
import assert from 'node:assert';
import { scrapeStrikePrice } from './index.js'; // Note the .js extension needed for ESM when not using bundlers

// We mock fetch for the unit test so we don't rely on network and polymarket's actual site structure all the time.
test('scrapeStrikePrice extracts openPrice correctly from a mocked HTML payload', async (t) => {
    // Save the original fetch
    const originalFetch = global.fetch;

    // Mock fetch to return a specific HTML structure
    global.fetch = async (url: RequestInfo | URL, options?: RequestInit) => {
        return new Response(
            `<html>
        <head>
          <script id="__NEXT_DATA__" type="application/json" crossorigin="anonymous">
            {
              "props": {
                "pageProps": {
                  "dehydratedState": {
                    "queries": [
                      {
                        "queryKey": ["crypto-prices", "price", "ETH", "2026-03-04T05:35:00Z", "fiveminute", "2026-03-04T05:40:00Z"],
                        "state": {
                          "data": {
                            "openPrice": 1234.56,
                            "closePrice": 1240.00
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          </script>
        </head>
        <body></body>
      </html>`,
            { status: 200 }
        );
    };

    try {
        const price = await scrapeStrikePrice('https://fake-polymarket.com/event/test');
        assert.strictEqual(price, 1234.56);
    } finally {
        // Restore the original fetch
        global.fetch = originalFetch;
    }
});

test('scrapeStrikePrice handles missing __NEXT_DATA__ gracefully', async (t) => {
    const originalFetch = global.fetch;

    global.fetch = async (url: RequestInfo | URL, options?: RequestInit) => {
        return new Response(`<html><body><h1>No data here!</h1></body></html>`, { status: 200 });
    };

    try {
        const price = await scrapeStrikePrice('https://fake-polymarket.com/event/missing');
        assert.strictEqual(price, null);
    } finally {
        global.fetch = originalFetch;
    }
});

test('scrapeStrikePrice fetches real market data from Polymarket (Integration)', async (t) => {
    // Note: This test makes a real network request. It could fail if Polymarket changes its structure,
    // the market is removed, or if Polymarket blocks the request.
    const url = 'https://polymarket.com/event/eth-updown-5m-1772602500/eth-updown-5m-1772602500';
    const price = await scrapeStrikePrice(url);

    // We don't know the *exact* price since it's historical, but we know it should be a number (not null).
    assert.strictEqual(typeof price, 'number');
    assert.ok(price > 0, 'Price should be greater than 0');
});
