export async function getCryptoPrices(symbols: string[]): Promise<Record<string, number>> {
    if (!symbols.length) return {};

    const coinIds: Record<string, string> = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'USDT': 'tether',
        'USDC': 'usd-coin',
        'BNB': 'binancecoin',
        'SOL': 'solana',
        'XRP': 'ripple',
        'ADA': 'cardano',
        'DOGE': 'dogecoin',
        // Add more mappings as needed
    };

    const ids = symbols
        .map(s => coinIds[s] || s.toLowerCase())
        .filter(Boolean)
        .join(',');

    try {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
            { next: { revalidate: 60 } } // Cache for 1 minute
        );

        if (!response.ok) {
            console.error('Failed to fetch crypto prices');
            return {};
        }

        const data = await response.json();

        // Map back to symbols
        const prices: Record<string, number> = {};
        symbols.forEach(symbol => {
            const id = coinIds[symbol] || symbol.toLowerCase();
            // Hardcode stablecoins to $1
            if (['USDT', 'USDC', 'DAI', 'BUSD'].includes(symbol.toUpperCase())) {
                prices[symbol] = 1;
                return;
            }

            if (data[id]?.usd) {
                prices[symbol] = data[id].usd;
            }
        });

        return prices;
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        return {};
    }
}
