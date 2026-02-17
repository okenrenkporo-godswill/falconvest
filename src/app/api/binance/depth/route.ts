import { NextRequest, NextResponse } from 'next/server';

const symbolMap: Record<string, string> = {
  'BTCUSDT': 'bitcoin',
  'ETHUSDT': 'ethereum',
  'SOLUSDT': 'solana',
  'BNBUSDT': 'binancecoin',
  'XRPUSDT': 'ripple',
  'ADAUSDT': 'cardano',
  'DOGEUSDT': 'dogecoin',
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol') || 'BTCUSDT';
  const limit = parseInt(searchParams.get('limit') || '20');
  const coinId = symbolMap[symbol] || 'bitcoin';

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`,
      { next: { revalidate: 2 } }
    );
    const data = await response.json();
    const currentPrice = data.market_data.current_price.usd;
    
    const bids = Array.from({ length: limit }, (_, i) => {
      const price = currentPrice * (1 - (i + 1) * 0.0001);
      const amount = Math.random() * 2 + 0.1;
      return [price.toFixed(2), amount.toFixed(4)];
    });
    
    const asks = Array.from({ length: limit }, (_, i) => {
      const price = currentPrice * (1 + (i + 1) * 0.0001);
      const amount = Math.random() * 2 + 0.1;
      return [price.toFixed(2), amount.toFixed(4)];
    });
    
    return NextResponse.json({ bids, asks });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order book' }, { status: 500 });
  }
}
