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

    // Fetch Assets - Using mock data due to API restrictions
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        // Mock top crypto assets
        const mockAssets = [
            { key: "BTCUSDT", label: "BTC/USDT", name: "Bitcoin", icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=035" },
            { key: "ETHUSDT", label: "ETH/USDT", name: "Ethereum", icon: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=035" },
            { key: "SOLUSDT", label: "SOL/USDT", name: "Solana", icon: "https://cryptologos.cc/logos/solana-sol-logo.svg?v=035" },
            { key: "BNBUSDT", label: "BNB/USDT", name: "BNB", icon: "https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=035" },
            { key: "XRPUSDT", label: "XRP/USDT", name: "Ripple", icon: "https://cryptologos.cc/logos/xrp-xrp-logo.svg?v=035" },
            { key: "ADAUSDT", label: "ADA/USDT", name: "Cardano", icon: "https://cryptologos.cc/logos/cardano-ada-logo.svg?v=035" },
            { key: "DOGEUSDT", label: "DOGE/USDT", name: "Dogecoin", icon: "https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=035" },
        ];
        
        setAssets(mockAssets);
    }, []);

    // Fetch real-time ticker data from Binance
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const fetchTicker = async () => {
            try {
                const response = await fetch(`/api/binance/ticker?symbol=${symbol}`);
                if (response.ok) {
                    const data = await response.json();
                    setTicker(data);
                }
            } catch (error) {
                console.error('Failed to fetch ticker:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTicker();
        const interval = setInterval(fetchTicker, 10000); // Update every 10 seconds
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
                        className="max-w-[200px]"
                        classNames={{
                            popoverContent: "w-[300px]",
                        }}
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
                                <div className="flex gap-2 items-center py-1">
                                    <Avatar alt={asset.name} className="w-8 h-8" src={asset.icon} />
                                    <div className="flex flex-col">
                                        <span className="text-base text-default-900 font-bold">{asset.label}</span>
                                        <span className="text-xs text-default-500">{asset.name}</span>
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
