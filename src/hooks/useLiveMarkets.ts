"use client";

import { useState, useEffect, useRef } from "react";

export type MarketCategory = "Forex" | "Shares" | "Indices" | "ETFs" | "Cryptocurrencies" | "Commodities";

export interface MarketAsset {
    id: string;
    name: string;
    symbol: string;
    image?: string;
    price: number;
    buy: number;
    sell: number;
    change24h: number;
    trend: number[];
    category: MarketCategory;
}

export function useLiveMarkets() {
    const [marketData, setMarketData] = useState<Record<MarketCategory, MarketAsset[]>>({
        Forex: [],
        Shares: [],
        Indices: [],
        ETFs: [],
        Cryptocurrencies: [],
        Commodities: [],
    });
    const [loading, setLoading] = useState(true);
    const [lastUpdates, setLastUpdates] = useState<Record<string, boolean | null>>({});
    const prevPricesRef = useRef<Record<string, number>>({});

    const fetchCrypto = async () => {
        try {
            const response = await fetch(
                "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h"
            );

            if (!response.ok) throw new Error("API Limit");

            const data = await response.json();
            if (Array.isArray(data)) {
                const mapped: MarketAsset[] = data.map((coin: any) => ({
                    id: coin.id,
                    name: coin.name,
                    symbol: coin.symbol.toUpperCase(),
                    image: coin.image,
                    price: coin.current_price,
                    buy: coin.current_price,
                    sell: coin.current_price * 0.9995,
                    change24h: coin.price_change_percentage_24h,
                    trend: coin.sparkline_in_7d.price.slice(-15),
                    category: "Cryptocurrencies",
                }));

                updateMarketSlice("Cryptocurrencies", mapped);
            }
        } catch (e) {
            console.warn("Crypto fetch failed, using fallback data", e);
            // Fallback Mock Data
            const fallbackCrypto: MarketAsset[] = [
                { id: "bitcoin", name: "Bitcoin", symbol: "BTC", price: 47500, buy: 47500, sell: 47480, change24h: 2.5, trend: [46000, 46500, 46200, 47000, 47500], category: "Cryptocurrencies" },
                { id: "ethereum", name: "Ethereum", symbol: "ETH", price: 2500, buy: 2500, sell: 2490, change24h: 1.2, trend: [2400, 2420, 2450, 2480, 2500], category: "Cryptocurrencies" },
                { id: "binancecoin", name: "BNB", symbol: "BNB", price: 320, buy: 320, sell: 319, change24h: -0.5, trend: [325, 324, 322, 321, 320], category: "Cryptocurrencies" },
                { id: "solana", name: "Solana", symbol: "SOL", price: 110, buy: 110, sell: 109, change24h: 5.4, trend: [100, 102, 105, 108, 110], category: "Cryptocurrencies" },
                { id: "ripple", name: "XRP", symbol: "XRP", price: 0.55, buy: 0.55, sell: 0.549, change24h: 0.1, trend: [0.54, 0.54, 0.55, 0.55, 0.55], category: "Cryptocurrencies" },
            ];
            updateMarketSlice("Cryptocurrencies", fallbackCrypto);
        }
    };

    // ... (fetchForex remains the same)

    const fetchForex = async () => {
        try {
            const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
            const json = await response.json();
            const rates = json.rates;

            const pairs = [
                { id: "eurusd", name: "EUR/USD", symbol: "EURUSD", price: 1 / rates.EUR },
                { id: "gbpusd", name: "GBP/USD", symbol: "GBPUSD", price: 1 / rates.GBP },
                { id: "usdjpy", name: "USD/JPY", symbol: "USDJPY", price: rates.JPY },
                { id: "audusd", name: "AUD/USD", symbol: "AUDUSD", price: 1 / rates.AUD },
                { id: "usdchf", name: "USD/CHF", symbol: "USDCHF", price: rates.CHF },
                { id: "usdcad", name: "USD/CAD", symbol: "USDCAD", price: rates.CAD },
            ];

            const mapped: MarketAsset[] = pairs.map(item => ({
                ...item,
                buy: item.price,
                sell: item.price * 0.9995,
                change24h: Number((Math.random() * 0.4 - 0.2).toFixed(4)),
                trend: Array.from({ length: 15 }, () => Math.random() * 0.01 + item.price),
                category: "Forex"
            }));

            updateMarketSlice("Forex", mapped);
        } catch (e) {
            console.error("Forex fetch failed", e);
            // Fallback for Forex
            const fallbackForex: MarketAsset[] = [
                { id: "eurusd", name: "EUR/USD", symbol: "EURUSD", price: 1.08, buy: 1.08, sell: 1.0795, change24h: 0.1, trend: [], category: "Forex" },
                // ... minimally populate if needed, but error logging is fine for now
            ];
            // updateMarketSlice("Forex", fallbackForex);
        }
    };

    const simulateOthers = () => {
        const baseData: Partial<Record<MarketCategory, any[]>> = {
            Shares: [
                { id: "aapl", name: "Apple Inc.", symbol: "AAPL", price: 182.34 },
                { id: "tsla", name: "Tesla, Inc.", symbol: "TSLA", price: 193.56 },
                { id: "nvda", name: "NVIDIA Corp.", symbol: "NVDA", price: 726.12 },
                { id: "msft", name: "Microsoft Corp.", symbol: "MSFT", price: 405.21 },
            ],
            Indices: [
                { id: "us30", name: "Wall Street 30", symbol: "US30", price: 38624.5 },
                { id: "nas100", name: "US Tech 100", symbol: "NAS100", price: 17856.4 },
                { id: "spx500", name: "US SPX 500", symbol: "SPX500", price: 5026.8 },
            ],
            Commodities: [
                { id: "gold", name: "Gold", symbol: "XAUUSD", price: 2018.45 },
                { id: "oil", name: "Crude Oil", symbol: "WTI", price: 78.56 },
                { id: "silver", name: "Silver", symbol: "XAGUSD", price: 22.85 },
            ]
        };

        Object.entries(baseData).forEach(([cat, items]) => {
            const mapped: MarketAsset[] = items.map(item => {
                const prevPrice = prevPricesRef.current[item.id] || item.price;
                const volatility = cat === "Indices" ? 0.0005 : 0.001;
                const change = (Math.random() - 0.5) * prevPrice * volatility;
                const newPrice = prevPrice + change;
                return {
                    ...item,
                    price: newPrice,
                    buy: newPrice,
                    sell: newPrice * 0.9995,
                    change24h: Number((Math.random() * 4 - 2).toFixed(2)),
                    trend: Array.from({ length: 15 }, () => Math.random() * 100),
                    category: cat as MarketCategory
                };
            });
            updateMarketSlice(cat as MarketCategory, mapped);
        });
    };

    const updateMarketSlice = (cat: MarketCategory, assets: MarketAsset[]) => {
        setMarketData(prev => ({ ...prev, [cat]: assets }));

        const updates: Record<string, boolean | null> = {};
        assets.forEach(asset => {
            if (prevPricesRef.current[asset.id]) {
                if (asset.buy > prevPricesRef.current[asset.id]) updates[asset.id] = true;
                else if (asset.buy < prevPricesRef.current[asset.id]) updates[asset.id] = false;
            }
            prevPricesRef.current[asset.id] = asset.buy;
        });
        setLastUpdates(prev => ({ ...prev, ...updates }));
        setTimeout(() => {
            setLastUpdates(prev => {
                const next = { ...prev };
                assets.forEach(a => delete next[a.id]);
                return next;
            });
        }, 1000);
    };

    useEffect(() => {
        const init = async () => {
            await Promise.all([fetchCrypto(), fetchForex()]);
            simulateOthers();
            setLoading(false);
        };
        init();

        const interval = setInterval(() => {
            fetchCrypto();
            fetchForex();
            simulateOthers();
        }, 60000); // Increased to 60s to avoid rate limits

        return () => clearInterval(interval);
    }, []);

    return { marketData, loading, lastUpdates };
}
