import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Binance');
    }

    const data = await response.json();
    
    // Filter for USDT pairs, sort by volume, get top 30
    const usdtPairs = data
      .filter((ticker: any) => 
        ticker.symbol.endsWith('USDT') &&
        !ticker.symbol.includes('UP') &&
        !ticker.symbol.includes('DOWN') &&
        !ticker.symbol.includes('BULL') &&
        !ticker.symbol.includes('BEAR')
      )
      .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, 30);

    return NextResponse.json(usdtPairs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pairs' }, { status: 500 });
  }
}
