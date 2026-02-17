"use client";

import { Card, CardBody } from "@heroui/react";
import { useEffect, useState } from "react";

interface Order {
    price: number;
    amount: number;
    total: number;
}

interface OrderBookProps {
    symbol?: string;
    compact?: boolean;
}

export function OrderBook({ symbol = "BTCUSDT", compact = false }: OrderBookProps) {
    const [bids, setBids] = useState<Order[]>([]);
    const [asks, setAsks] = useState<Order[]>([]);
    const [currentPrice, setCurrentPrice] = useState<number>(0);

    useEffect(() => {
        // Fetch real-time order book from Binance
        const fetchOrderBook = async () => {
            try {
                const response = await fetch(`/api/binance/depth?symbol=${symbol}&limit=20`);
                if (response.ok) {
                    const data = await response.json();
                    
                    const formattedBids = data.bids.map((bid: string[]) => ({
                        price: parseFloat(bid[0]),
                        amount: parseFloat(bid[1]),
                        total: parseFloat(bid[0]) * parseFloat(bid[1])
                    }));
                    
                    const formattedAsks = data.asks.map((ask: string[]) => ({
                        price: parseFloat(ask[0]),
                        amount: parseFloat(ask[1]),
                        total: parseFloat(ask[0]) * parseFloat(ask[1])
                    }));
                    
                    setBids(formattedBids);
                    setAsks(formattedAsks);
                    
                    if (formattedBids.length && formattedAsks.length) {
                        setCurrentPrice((formattedBids[0].price + formattedAsks[0].price) / 2);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch order book:', error);
            }
        };

        fetchOrderBook();
        const interval = setInterval(fetchOrderBook, 10000); // Update every 10 seconds
        return () => clearInterval(interval);
    }, [symbol]);

    return (
        <Card className="border-none shadow-sm dark:bg-zinc-900 h-full">
            <CardBody className={`p-0 font-mono ${compact ? 'text-[10px]' : 'text-xs'}`}>
                {/* Header */}
                <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-3'} p-2 text-default-400 border-b border-default-100 dark:border-default-50/10 mb-1`}>
                    <span>Price</span>
                    <span className="text-right">Amount</span>
                    {!compact && <span className="text-right">Total</span>}
                </div>

                {/* Asks (Sells) - Red - Render from bottom up for visual logic? Use flex-col-reverse */}
                <div className={`flex flex-col-reverse space-y-reverse overflow-hidden ${compact ? 'h-[180px]' : 'h-[200px] sm:h-[calc(50%-40px)]'}`}>
                    {[...asks].reverse().slice(0, compact ? 7 : 12).map((ask, i) => (
                        <div key={i} className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-3'} px-2 py-0.5 relative group hover:bg-default-100 dark:hover:bg-default-50/10 cursor-pointer`}>
                            <span className="text-red-500 font-semibold">{ask.price.toFixed(2)}</span>
                            <span className="text-right text-default-600 dark:text-default-400">{ask.amount.toFixed(4)}</span>
                            {!compact && <span className="text-right text-default-400 dark:text-default-600">{(ask.amount * ask.price / 1000).toFixed(1)}k</span>}
                        </div>
                    ))}
                </div>

                {/* Spread / Current Price Indicator */}
                <div className={`py-2 px-2 sm:px-4 my-1 text-center font-bold ${compact ? 'text-xs sm:text-sm' : 'text-base sm:text-lg'} text-default-900 dark:text-white border-y border-default-100 dark:border-default-50/10 bg-default-50 dark:bg-black/20`}>
                    {currentPrice > 0 ? currentPrice.toFixed(2) : "Loading..."}
                    {!compact && currentPrice > 0 && (
                        <span className="text-xs text-default-400 font-normal ml-2">
                            ≈ ${currentPrice.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* Bids (Buys) - Green - High to Low */}
                <div className={`overflow-hidden ${compact ? 'h-[180px]' : 'h-[200px] sm:h-[calc(50%-40px)]'}`}>
                    {bids.slice(0, compact ? 7 : 12).map((bid, i) => (
                        <div key={i} className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-3'} px-2 py-0.5 relative group hover:bg-default-100 dark:hover:bg-default-50/10 cursor-pointer`}>
                            <span className="text-green-500 font-semibold">{bid.price.toFixed(2)}</span>
                            <span className="text-right text-default-600 dark:text-default-400">{bid.amount.toFixed(4)}</span>
                            {!compact && <span className="text-right text-default-400 dark:text-default-600">{(bid.amount * bid.price / 1000).toFixed(1)}k</span>}
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}
