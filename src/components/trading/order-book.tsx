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

export function OrderBook({ symbol, compact = false }: OrderBookProps) {
    const [bids, setBids] = useState<Order[]>([]);
    const [asks, setAsks] = useState<Order[]>([]);

    useEffect(() => {
        // Helper to generate initial data
        const generateOrders = (basePrice: number, type: 'bid' | 'ask') => {
            const orders: Order[] = [];
            for (let i = 0; i < 15; i++) {
                const price = type === 'bid'
                    ? basePrice - (i * 5) - Math.random() * 5
                    : basePrice + (i * 5) + Math.random() * 5;
                const amount = Math.random() * 2;
                orders.push({
                    price,
                    amount,
                    total: amount * price
                });
            }
            return orders;
        };

        const initialPrice = 45000;
        setBids(generateOrders(initialPrice, 'bid'));
        setAsks(generateOrders(initialPrice, 'ask').reverse());

        // Simulate live updates
        const interval = setInterval(() => {
            setBids(prev => prev.map(o => ({
                ...o,
                price: o.price + (Math.random() - 0.5) * 10, // Slight price drift
                amount: Math.max(0.1, o.amount + (Math.random() - 0.5)) // Volume change
            })).sort((a, b) => b.price - a.price));

            setAsks(prev => prev.map(o => ({
                ...o,
                price: o.price + (Math.random() - 0.5) * 10,
                amount: Math.max(0.1, o.amount + (Math.random() - 0.5))
            })).sort((a, b) => a.price - b.price));
        }, 1000);

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
                <div className={`py-2 px-4 my-1 text-center font-bold ${compact ? 'text-sm' : 'text-lg'} text-default-900 dark:text-white border-y border-default-100 dark:border-default-50/10 bg-default-50 dark:bg-black/20`}>
                    {bids[0]?.price && asks[0]?.price
                        ? ((bids[0].price + asks[0].price) / 2).toFixed(2)
                        : "45000.00"}
                    {!compact && <span className="text-xs text-default-400 font-normal ml-2">≈ $45,000</span>}
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
