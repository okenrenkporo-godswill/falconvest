"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, CardBody, Spinner } from "@heroui/react";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: { price: number[] };
}

const PriceDisplay = ({ price, symbol }: { price: number; symbol: string }) => {
  const prevPriceRef = useRef(price);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (price > prevPriceRef.current) {
      setFlash("up");
    } else if (price < prevPriceRef.current) {
      setFlash("down");
    }
    prevPriceRef.current = price;

    const timer = setTimeout(() => setFlash(null), 1000);
    return () => clearTimeout(timer);
  }, [price]);

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: p < 1 ? 4 : 2,
    }).format(p);
  };

  return (
    <motion.span
      animate={{
        color: flash === "up" ? "#22c55e" : flash === "down" ? "#ef4444" : "currentColor",
        backgroundColor: flash === "up" ? "rgba(34, 197, 94, 0.1)" : flash === "down" ? "rgba(239, 68, 68, 0.1)" : "transparent",
      }}
      className="px-2 py-1 rounded transition-colors font-bold text-lg"
    >
      {formatPrice(price)}
    </motion.span>
  );
};

export default function MarketStats() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMarketData = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,ripple,aave,tether-gold,apecoin,ethereum-classic&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h"
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setCoins(data);
      }
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 15000); // 15s updates for "live" feel
    return () => clearInterval(interval);
  }, []);

  const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
    if (!data) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const width = 100;
    const height = 30;
    
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          points={points}
        />
      </svg>
    );
  };

  if (loading && coins.length === 0) {
    return (
      <div className="w-full py-20 flex justify-center items-center bg-transparent">
        <Spinner color="danger" size="lg" label="Updating live market..." />
      </div>
    );
  }

  const mainCoins = coins.slice(0, 6);
  const topGainers = [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 3);
  const newListings = coins.slice(3, 6);

  return (
    <div className="w-full bg-[#f8f9fa] dark:bg-neutral-950 transition-colors duration-500 py-16 px-4">
      <div className="container mx-auto grid lg:grid-cols-3 gap-8">
        
        {/* Most Traded Coins (Left Col) */}
        <Card className="lg:col-span-2 bg-white dark:bg-neutral-900 shadow-sm dark:shadow-none border border-black/5 dark:border-white/5 rounded-[1.5rem] p-2 lg:p-6 transition-colors duration-500">
          <CardBody>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                <h2 className="text-xl font-bold text-black dark:text-white relative">
                  Most traded coins
                  <span className="absolute bottom-[-17px] left-0 w-full h-[2px] bg-[#FF6347]" />
                </h2>
              </div>
              
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-neutral-400 text-xs font-semibold uppercase tracking-wider border-b border-neutral-50">
                      <th className="pb-4">Trading Pairs</th>
                      <th className="pb-4">Last Traded Price</th>
                      <th className="pb-4">24H Change</th>
                      <th className="pb-4 hidden md:table-cell">Charts</th>
                      <th className="pb-4 text-right pr-4">Trade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mainCoins.map((coin) => (
                      <tr key={coin.id} className="group border-b border-neutral-50 last:border-0">
                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                            <span className="font-bold text-black dark:text-white uppercase tracking-tight">{coin.symbol}/USDT</span>
                          </div>
                        </td>
                        <td className="py-5">
                          <PriceDisplay price={coin.current_price} symbol={coin.symbol} />
                          <span className="ml-2 text-[10px] text-neutral-400 font-medium">USD</span>
                        </td>
                        <td className="py-5">
                          <span className={`${coin.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"} font-bold text-base`}>
                            {coin.price_change_percentage_24h >= 0 ? "+" : ""}{coin.price_change_percentage_24h.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-5 hidden md:table-cell">
                          <Sparkline 
                            data={coin.sparkline_in_7d.price} 
                            color={coin.price_change_percentage_24h >= 0 ? "#22c55e" : "#ef4444"} 
                          />
                        </td>
                        <td className="py-5 text-right pr-4">
                          <Button 
                            variant="bordered" 
                            className="border-[#FF6347] text-[#FF6347] hover:bg-[#FF6347] hover:text-white font-bold rounded-lg px-8 transition-all h-9"
                          >
                            Trade
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Right Column: Gainers & Listings */}
        <div className="flex flex-col gap-6">
          {/* Top Gainers */}
          <Card className="bg-white dark:bg-neutral-900 shadow-sm dark:shadow-none border border-black/5 dark:border-white/5 rounded-[1.5rem] p-6 lg:p-8 transition-colors duration-500">
            <CardBody className="p-0">
              <h2 className="text-lg font-bold text-black dark:text-white mb-8">Top Gainers</h2>
              <div className="flex flex-col gap-8">
                {topGainers.map((coin) => (
                  <div key={coin.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center p-2">
                        <img src={coin.image} alt={coin.symbol} className="w-full h-full object-contain" />
                      </div>
                      <span className="font-bold text-neutral-800 uppercase text-sm">{coin.symbol}/USDC</span>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-black dark:text-white text-sm whitespace-nowrap">{coin.current_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                      <p className="text-green-500 text-xs font-bold">+{coin.price_change_percentage_24h.toFixed(2)}% 24h</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* New Listings */}
          <Card className="bg-white dark:bg-neutral-900 shadow-sm dark:shadow-none border border-black/5 dark:border-white/5 rounded-[1.5rem] p-6 lg:p-8 transition-colors duration-500">
            <CardBody className="p-0">
              <h2 className="text-lg font-bold text-black dark:text-white mb-8">New Listings</h2>
              <div className="flex flex-col gap-8">
                {newListings.map((coin) => (
                  <div key={coin.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center p-2">
                         <img src={coin.image} alt={coin.symbol} className="w-full h-full object-contain" />
                      </div>
                      <span className="font-bold text-neutral-800 uppercase text-sm">{coin.symbol}/USDT</span>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-black dark:text-white text-sm whitespace-nowrap">{coin.current_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                      <p className={`${coin.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"} text-xs font-bold`}>
                        {coin.price_change_percentage_24h >= 0 ? "+" : ""}{coin.price_change_percentage_24h.toFixed(2)}% 24h
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

      </div>
    </div>
  );
}
