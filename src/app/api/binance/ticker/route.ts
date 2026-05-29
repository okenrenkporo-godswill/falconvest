import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
  const coinId = symbolMap[symbol] || 'bitcoin';

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`,
      { next: { revalidate: 5 } }
    );
    const data = await response.json();
    
    const ticker = {
      symbol,
      lastPrice: data.market_data.current_price.usd.toString(),
      priceChange: data.market_data.price_change_24h.toString(),
      priceChangePercent: data.market_data.price_change_percentage_24h.toString(),
      highPrice: data.market_data.high_24h.usd.toString(),
      lowPrice: data.market_data.low_24h.usd.toString(),
      volume: data.market_data.total_volume.usd.toString(),
    };
    
    return NextResponse.json(ticker);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ticker' }, { status: 500 });
  }
}
