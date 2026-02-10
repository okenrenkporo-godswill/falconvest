"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardBody, Skeleton, Select, SelectItem, Avatar, Button } from "@heroui/react";
import { Activity } from "lucide-react";

interface TickerData {
    symbol: string;
    lastPrice: string;
    priceChange: string;
    priceChangePercent: string;
    highPrice: string;
    lowPrice: string;
    volume: string;
}

interface Asset {
    key: string;
    label: string;
    name: string;
    icon: string;
}

interface TradingHeaderProps {
    symbol: string;
    onSymbolChange: (symbol: string) => void;
    onToggleChart?: () => void;
}

export function TradingHeader({ symbol, onSymbolChange, onToggleChart }: TradingHeaderProps) {
    const [ticker, setTicker] = useState<TickerData | null>(null);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch Assets (Pairs)
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                // Fetch top USDT pairs from Binance
                const response = await fetch("https://api.binance.com/api/v3/exchangeInfo");
                const data = await response.json();

                // Filter for USDT pairs and sort/limit to popular ones or just take first 50 for performance
                // In a real app, strict filtering or pagination is needed.
                const usdtPairs = data.symbols
                    .filter((s: any) => s.quoteAsset === "USDT" && s.status === "TRADING")
                    .slice(0, 100) // Limit to 100 for dropdown performance
                    .map((s: any) => ({
                        key: s.symbol,
                        label: `${s.baseAsset}/${s.quoteAsset}`,
                        name: s.baseAsset, // Use base asset as name
                        icon: `https://cryptologos.cc/logos/${s.baseAsset.toLowerCase()}-${s.baseAsset.toLowerCase()}-logo.svg?v=035`
                        // Note: Icon URL is a best-guess fallback. Many will fail, but common ones work.
                    }));

                // Ensure initial symbol is in list
                if (!usdtPairs.find((p: any) => p.key === "BTCUSDT")) {
                    usdtPairs.unshift({ key: "BTCUSDT", label: "BTC/USDT", name: "BTC", icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=035" });
                }

                setAssets(usdtPairs);
            } catch (error) {
                console.error("Failed to fetch assets:", error);
                // Fallback
                setAssets([
                    { key: "BTCUSDT", label: "BTC/USDT", name: "Bitcoin", icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=035" },
                    { key: "ETHUSDT", label: "ETH/USDT", name: "Ethereum", icon: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=035" },
                ]);
            }
        };
        fetchAssets();
    }, []);

    // Fetch Ticker
    useEffect(() => {
        setLoading(true);
        const fetchTicker = async () => {
            try {
                const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
                const data = await response.json();
                setTicker(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch ticker:", error);
                setLoading(false);
            }
        };

        fetchTicker();
        const interval = setInterval(fetchTicker, 5000);
        return () => clearInterval(interval);
    }, [symbol]);

    return (
        <Card className="border-none shadow-sm dark:bg-zinc-900 w-full mb-1 overflow-visible">
            <CardBody className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                {/* Asset Selector */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {onToggleChart && (
                        <Button isIconOnly variant="light" size="sm" onPress={onToggleChart} className="text-default-500">
                            <Activity size={20} />
                        </Button>
                    )}
                    <Select
                        items={assets}
                        aria-label="Select Asset"
                        selectedKeys={[symbol]}
                        onChange={(e) => {
                            if (e.target.value) onSymbolChange(e.target.value);
                        }}
                        className="max-w-[180px]"
                        renderValue={(items) => {
                            return items.map((item) => (
                                <div key={item.key} className="flex gap-2 items-center">
                                    {/* Fallback icon handling could be done with a custom component, but keeping simple */}
                                    <Avatar alt={item.data?.name} className="w-6 h-6" src={item.data?.icon} />
                                    <div className="flex flex-col">
                                        <span className="text-small font-bold">{item.data?.label}</span>
                                    </div>
                                </div>
                            ));
                        }}
                        scrollShadowProps={{
                            isEnabled: false
                        }}
                    >
                        {(asset) => (
                            <SelectItem key={asset.key} textValue={asset.label}>
                                <div className="flex gap-2 items-center">
                                    <Avatar alt={asset.name} className="w-6 h-6" src={asset.icon} />
                                    <div className="flex flex-col">
                                        <span className="text-small text-default-900 font-bold">{asset.label}</span>
                                        <span className="text-tiny text-default-500">{asset.name}</span>
                                    </div>
                                </div>
                            </SelectItem>
                        )}
                    </Select>
                </div>

                {/* Ticker Stats */}
                {loading || !ticker ? (
                    <div className="flex gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <Skeleton className="h-8 w-24 rounded-lg" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                ) : (
                    <div className="flex flex-row flex-wrap items-center justify-between sm:justify-end gap-4 sm:gap-8 w-full sm:w-auto overflow-x-auto">
                        {/* Price */}
                        <div className="flex flex-col">
                            <span className={`text-xl sm:text-2xl font-bold tracking-tight ${parseFloat(ticker.priceChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ${parseFloat(ticker.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-default-400 flex items-center gap-1">
                                {parseFloat(ticker.priceChangePercent).toFixed(2)}%
                            </span>
                        </div>

                        {/* 24h Details */}
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
                                <p className="text-default-400 text-[10px] uppercase">24h Vol</p>
                                <p className="font-semibold">{parseFloat(ticker.volume).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                        </div>
                    </div>
                )}

            </CardBody>
        </Card>
    );
}
