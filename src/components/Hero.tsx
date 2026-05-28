"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/react";
import Link from "next/link";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

/* ─────────────────────────────────────────────
   CRYPTO TICKER
───────────────────────────────────────────── */
interface CryptoTick {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

function CryptoMarquee() {
  const [ticks, setTicks] = useState<CryptoTick[]>([]);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false",
          { next: { revalidate: 60 } }
        );
        if (res.ok) {
          const data = await res.json();
          setTicks(data);
        }
      } catch {
        // Fallback static data if API fails
        setTicks([
          { id: "bitcoin", symbol: "BTC", current_price: 67400, price_change_percentage_24h: 2.4, image: "" },
          { id: "ethereum", symbol: "ETH", current_price: 3580, price_change_percentage_24h: 1.8, image: "" },
          { id: "solana", symbol: "SOL", current_price: 172, price_change_percentage_24h: -0.9, image: "" },
          { id: "bnb", symbol: "BNB", current_price: 610, price_change_percentage_24h: 0.5, image: "" },
          { id: "xrp", symbol: "XRP", current_price: 0.52, price_change_percentage_24h: -1.2, image: "" },
          { id: "cardano", symbol: "ADA", current_price: 0.44, price_change_percentage_24h: 3.1, image: "" },
          { id: "dogecoin", symbol: "DOGE", current_price: 0.163, price_change_percentage_24h: 5.2, image: "" },
          { id: "avalanche", symbol: "AVAX", current_price: 38, price_change_percentage_24h: -2.1, image: "" },
          { id: "polkadot", symbol: "DOT", current_price: 7.8, price_change_percentage_24h: 1.3, image: "" },
          { id: "chainlink", symbol: "LINK", current_price: 14.5, price_change_percentage_24h: 4.7, image: "" },
        ]);
      }
    }
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const items = [...ticks, ...ticks]; // duplicate for seamless loop

  return (
    <div className="relative w-full bg-[#1e3640] dark:bg-black border-t border-b border-[#33525c]/30 overflow-hidden py-3">
      <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#1e3640] dark:from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#1e3640] dark:from-black to-transparent z-10 pointer-events-none" />

      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((coin, i) => {
          const up = coin.price_change_percentage_24h >= 0;
          const price = coin.current_price >= 1
            ? `$${coin.current_price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `$${coin.current_price.toFixed(4)}`;
          return (
            <span key={`${coin.id}-${i}`} className="inline-flex items-center gap-3 mx-8">
              {coin.image && (
                <img src={coin.image} alt={coin.symbol} className="w-5 h-5 rounded-full" />
              )}
              <span className="text-white font-black text-sm tracking-tight uppercase">{coin.symbol}</span>
              <span className="text-white/80 text-sm font-semibold">{price}</span>
              <span className={`flex items-center gap-0.5 text-xs font-bold ${up ? "text-green-400" : "text-red-400"}`}>
                {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {up ? "+" : ""}{coin.price_change_percentage_24h.toFixed(2)}%
              </span>
              <span className="text-white/20 text-xs">•</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SLIDE VISUALS
───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   SLIDES CONFIG
───────────────────────────────────────────── */
const SLIDES = [
  {
    badge: "Auto Copy Trading",
    title: "Pro Copy Trading",
    subtitle: "Automatically copy successful strategies in real time.",
    ctaPrimary: { label: "Start Copying", href: "/register" },
    ctaSecond: { label: "See Traders", href: "/register" },
    bgImage: "/images/hero1.jpg",
  },
  {
    badge: "Global Crypto Markets",
    title: "Trade Global Crypto",
    subtitle: "Instant execution for high-growth digital assets.",
    ctaPrimary: { label: "Trade Crypto", href: "/register" },
    ctaSecond: { label: "View Markets", href: "/markets/crypto" },
    bgImage: "/images/hero2.jpg",
  },
];


/* ─────────────────────────────────────────────
   MAIN HERO
───────────────────────────────────────────── */
export default function Hero() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(p => (p + 1) % SLIDES.length), []);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  const slide = SLIDES[current];

  return (
    <div className="w-full">
      {/* HERO SLIDER */}
      <section
        className="relative w-full min-h-[92vh] flex flex-col justify-center bg-black overflow-hidden pt-24 pb-10"
      >
        {/* Slide Background Image */}
        <div className="absolute inset-0 select-none z-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {slide.bgImage && (
              <motion.div
                key={`bg-${current}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.75 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <img
                  src={slide.bgImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
          </AnimatePresence>
          {/* Ambient gradient overlay for high contrast and modern aesthetics */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 dark:from-black dark:via-black/70 dark:to-black/40 z-10 pointer-events-none" />
        </div>

        {/* Ambient blobs */}
        <div className="absolute top-[-15%] left-[-8%] w-[55%] h-[55%] bg-[#33525c]/10 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[40%] bg-[#33525c]/10 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="container mx-auto px-6 lg:px-16 max-w-7xl relative z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl w-full"
            >
              {/* ── TEXT CONTENT ── */}
              <div className="flex flex-col items-start space-y-6">

                {/* Eyebrow badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[9px] font-black tracking-[0.2em] text-white uppercase">
                    {slide.badge}
                  </span>
                </div>

                {/* ── HEADLINE ── */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7eb2bd]">
                    FalconVest Platform
                  </p>
                  <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight">
                    {slide.title}
                  </h1>
                </div>

                {/* ── SUB-COPY ── */}
                <p className="text-[16px] md:text-[18px] text-neutral-200 leading-relaxed font-semibold max-w-2xl">
                  {slide.subtitle}
                </p>

                {/* ── TRUST PILLS ── */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: "⚡", label: "Instant Execution" },
                    { icon: "🎯", label: "Elite Signals" },
                    { icon: "🔒", label: "Secure & Regulated" },
                  ].map((pill) => (
                    <span
                      key={pill.label}
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80"
                    >
                      <span>{pill.icon}</span>
                      {pill.label}
                    </span>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-row gap-4 pt-2">
                  <Button
                    as={Link}
                    href={slide.ctaPrimary.href}
                    className="bg-[#7eb2bd] hover:bg-[#6da1ac] text-black font-black h-12 px-8 text-xs uppercase tracking-widest rounded-full shadow-lg shadow-[#7eb2bd]/20 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
                  >
                    {slide.ctaPrimary.label}
                    <ArrowRight size={13} />
                  </Button>
                  <Button
                    as={Link}
                    href={slide.ctaSecond.href}
                    variant="bordered"
                    className="border-white/20 text-white hover:bg-white/10 h-12 px-8 text-xs uppercase tracking-widest rounded-full"
                  >
                    {slide.ctaSecond.label}
                  </Button>
                </div>

                {/* Slide indicators (display-only, no click-to-change) */}
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex gap-1.5">
                    {SLIDES.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-500 ${
                          i === current ? "w-6 bg-white" : "w-2.5 bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">
                    {current + 1} / {SLIDES.length}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CRYPTO MARQUEE */}
      <CryptoMarquee />
    </div>
  );
}
