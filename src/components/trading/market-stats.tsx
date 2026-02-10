"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Skeleton } from "@heroui/react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface TickerData {
    symbol: string;
    lastPrice: string;
    priceChange: string;
    priceChangePercent: string;
    highPrice: string;
    lowPrice: string;
    volume: string;
}

export function MarketStats() {
    const [ticker, setTicker] = useState<TickerData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicker = async () => {
            try {
                const response = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT");
                const data = await response.json();
                setTicker(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch ticker:", error);
            }
        };

        fetchTicker();
        // Poll every 5 seconds
        const interval = setInterval(fetchTicker, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Card className="border-none shadow-sm dark:bg-zinc-900 w-full">
                <CardBody className="p-4 flex gap-4">
                    <Skeleton className="h-8 w-24 rounded-lg" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                </CardBody>
            </Card>
        )
    }

    if (!ticker) return null;

    const isPositive = parseFloat(ticker.priceChange) >= 0;

    return (
        <Card className="border-none shadow-sm dark:bg-zinc-900 w-full mb-1">
            <CardBody className="p-3 sm:p-4 flex flex-row flex-wrap items-center justify-between gap-4 sm:gap-8 overflow-x-auto">

                {/* Pair Info */}
                <div className="flex items-center gap-2">
                    <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                        BTC/USDT
                    </div>
                    <div className={`px-2 py-0.5 rounded text-xs font-semibold ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {isPositive ? "+" : ""}{parseFloat(ticker.priceChangePercent).toFixed(2)}%
                    </div>
                </div>

                {/* Last Price */}
                <div className="flex flex-col">
                    <span className={`text-xl sm:text-2xl font-bold tracking-tight ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        ${parseFloat(ticker.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-default-400 flex items-center gap-1">
                        <Activity size={12} /> Last Price
                    </span>
                </div>

                {/* 24h Stats */}
                <div className="flex gap-4 sm:gap-8 text-xs sm:text-sm">
                    <div>
                        <p className="text-default-400 text-[10px] uppercase">24h High</p>
                        <p className="font-semibold">${parseFloat(ticker.highPrice).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-default-400 text-[10px] uppercase">24h Low</p>
                        <p className="font-semibold">${parseFloat(ticker.lowPrice).toLocaleString()}</p>
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-default-400 text-[10px] uppercase">24h Vol (BTC)</p>
                        <p className="font-semibold">{parseFloat(ticker.volume).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                </div>

            </CardBody>
        </Card>
    );
}
