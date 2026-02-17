'use server';

export async function getTradingPairs() {
  try {
    // Fetch top crypto pairs from CoinGecko
    const cryptoResponse = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1',
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );
    
    if (!cryptoResponse.ok) {
      throw new Error('Failed to fetch crypto pairs');
    }

    const cryptoData = await cryptoResponse.json();
    
    const cryptoPairs = cryptoData.map((coin: any) => ({
      key: `${coin.symbol.toUpperCase()}USDT`,
      label: `${coin.symbol.toUpperCase()}/USDT`,
      name: coin.name,
      icon: coin.image,
      type: 'crypto' as const,
      price: coin.current_price,
    }));

    // Popular stock pairs (mock data - would need real stock API)
    const stockPairs = [
      { key: 'AAPL', label: 'AAPL/USD', name: 'Apple Inc.', icon: '🍎', type: 'stock' as const },
      { key: 'GOOGL', label: 'GOOGL/USD', name: 'Alphabet Inc.', icon: '🔍', type: 'stock' as const },
      { key: 'MSFT', label: 'MSFT/USD', name: 'Microsoft Corp.', icon: '🪟', type: 'stock' as const },
      { key: 'AMZN', label: 'AMZN/USD', name: 'Amazon.com Inc.', icon: '📦', type: 'stock' as const },
      { key: 'TSLA', label: 'TSLA/USD', name: 'Tesla Inc.', icon: '🚗', type: 'stock' as const },
      { key: 'META', label: 'META/USD', name: 'Meta Platforms', icon: '👥', type: 'stock' as const },
      { key: 'NVDA', label: 'NVDA/USD', name: 'NVIDIA Corp.', icon: '🎮', type: 'stock' as const },
    ];

    return {
      crypto: cryptoPairs,
      stocks: stockPairs,
      all: [...cryptoPairs, ...stockPairs],
    };
  } catch (error) {
    console.error('Error fetching trading pairs:', error);
    // Return fallback data
    return {
      crypto: [
        { key: 'BTCUSDT', label: 'BTC/USDT', name: 'Bitcoin', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg', type: 'crypto' as const },
        { key: 'ETHUSDT', label: 'ETH/USDT', name: 'Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg', type: 'crypto' as const },
      ],
      stocks: [],
      all: [
        { key: 'BTCUSDT', label: 'BTC/USDT', name: 'Bitcoin', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg', type: 'crypto' as const },
        { key: 'ETHUSDT', label: 'ETH/USDT', name: 'Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg', type: 'crypto' as const },
      ],
    };
  }
}
