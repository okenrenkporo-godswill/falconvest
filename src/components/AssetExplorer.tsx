"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Button, Spinner } from "@heroui/react";
import Link from "next/link";
import { useLiveMarkets, MarketCategory, MarketAsset } from "@/hooks/useLiveMarkets";

const CATEGORIES: MarketCategory[] = ["Forex", "Shares", "Indices", "ETFs", "Cryptocurrencies", "Commodities"];

const PriceCell = ({ value, isUp }: { value: number; isUp: boolean | null }) => {
  return (
    <div className={`font-mono text-sm font-bold transition-colors duration-500 ${
      isUp === true ? "text-green-500" : isUp === false ? "text-red-500" : "text-black dark:text-white"
    }`}>
      ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
    </div>
  );
};

const Sparkline = ({ trend, color }: { trend: number[], color: string }) => {
  if (!trend || trend.length === 0) return null;
  const min = Math.min(...trend);
  const max = Math.max(...trend);
  const range = max - min || 1;
  const points = trend.map((v, i) => `${(i / (trend.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(" ");

  return (
    <svg className="w-24 h-8 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export default function AssetExplorer() {
  const { marketData, loading, lastUpdates } = useLiveMarkets();
  const [activeCategory, setActiveCategory] = useState<MarketCategory>("Cryptocurrencies");
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    return marketData[activeCategory]?.filter((a: MarketAsset) => 
      a.name.toLowerCase().includes(search.toLowerCase()) || 
      a.symbol.toLowerCase().includes(search.toLowerCase())
    ) || [];
  }, [marketData, activeCategory, search]);

  return (
    <div className="w-full bg-transparent py-24 px-4 overflow-hidden transition-colors duration-500">
      <div className="container mx-auto">
        <div className="text-center mb-20 space-y-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black tracking-tight text-black dark:text-white"
          >
            Global access, <span className="text-[#FF6347] italic">unlimited potential.</span>
          </motion.h2>
          <p className="text-neutral-800 dark:text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Connect to the world's most liquid markets with institutional-grade execution. Seamlessly navigate top assets across Forex, Stocks, Indices, and Crypto on a platform designed for the sophisticated trader.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-72 bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] border border-black/5 dark:border-white/5 p-4 shrink-0 shadow-2xl">
            <div className="mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-400 mb-4 px-2">Market Segments</h3>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input 
                      type="text" 
                      placeholder="Search symbols..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-black border border-black/5 dark:border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-black dark:text-white focus:outline-none focus:border-[#FF6347] transition-all"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeCategory === cat 
                      ? "bg-[#FF6347] text-white shadow-lg shadow-[#FF6347]/20" 
                      : "text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Main Table Content */}
          <div className="flex-1 w-full relative min-h-[500px]">
            {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <Spinner color="danger" size="lg" />
                    <p className="text-xs font-black uppercase tracking-widest text-neutral-900 dark:text-neutral-500">Connecting to feed...</p>
                </div>
            ) : (
                <div className="bg-neutral-50 dark:bg-[#0A0A0A]/50 border border-black/5 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-neutral-900 dark:text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-black/5 dark:border-white/5">
                                    <th className="px-8 py-6">Instrument</th>
                                    <th className="px-8 py-6 text-right">Price</th>
                                    <th className="px-8 py-6 text-right">Spread</th>
                                    <th className="px-8 py-6 text-right">24H Change</th>
                                    <th className="px-8 py-6">Trend</th>
                                    <th className="px-8 py-6 text-right">Execution</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                {filteredData.map((asset) => (
                                    <motion.tr
                                    key={asset.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group border-b border-black/5 dark:border-white/5 last:border-0"
                                    >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-black border border-black/5 dark:border-white/5 flex items-center justify-center overflow-hidden">
                                                {asset.image ? (
                                                    <img src={asset.image} alt={asset.name} className="w-6 h-6 object-contain" />
                                                ) : (
                                                    <div className="p-2 rounded-lg bg-[#FF6347]/10 text-[#FF6347]">
                                                        <TrendingUp size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-black dark:text-white uppercase text-sm tracking-tighter">{asset.name}</p>
                                                <p className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase">{asset.symbol}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <PriceCell value={asset.buy} isUp={lastUpdates[asset.id]} />
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-500 font-mono">
                                            {(Math.abs(asset.buy - asset.sell) * 1000).toFixed(1)} Pips
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className={`text-xs font-black p-2 rounded-lg ${asset.change24h >= 0 ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"}`}>
                                            {asset.change24h >= 0 ? "+" : ""}{asset.change24h.toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Sparkline trend={asset.trend} color={asset.change24h >= 0 ? "#22c55e" : "#ef4444"} />
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Button 
                                            as={Link}
                                            href="/register"
                                            size="sm"
                                            className="bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-widest rounded-full px-6 hover:bg-[#FF6347] dark:hover:bg-[#FF6347] hover:text-white transition-all"
                                        >
                                            Trade
                                        </Button>
                                    </td>
                                    </motion.tr>
                                ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <div className="mt-8 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-neutral-900 dark:text-neutral-400">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live Feeds Active
               </div>
               <div className="italic opacity-50">Liquidity by MasterSync Institutional</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
