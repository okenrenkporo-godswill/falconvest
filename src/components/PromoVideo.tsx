"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Candlestick Component
// Candlestick Component
const CandlestickBackground = () => {
  const [candles, setCandles] = useState<any[]>([]);

  useEffect(() => {
    const newCandles = [...Array(10)].map(() => ({
      height: Math.random() * 60 + 20,
      isGreen: Math.random() > 0.5,
      delay: Math.random() * 2,
      duration: Math.random() * 5 + 5,
      marginTop: Math.random() * 200
    }));
    setCandles(newCandles);
  }, []);

  if (candles.length === 0) return null;

  return (
    <div className="absolute inset-0 z-0 opacity-20 flex gap-2 justify-center overflow-hidden pointer-events-none">
      {candles.map((candle, i) => {
        const color = candle.isGreen ? "bg-green-500" : "bg-red-500";
        return (
          <motion.div
             key={i}
             initial={{ y: 200, opacity: 0 }}
             animate={{ y: -200, opacity: [0, 1, 0] }}
             transition={{ 
               duration: candle.duration, 
               repeat: Infinity, 
               ease: "linear",
               delay: candle.delay 
             }}
             className="flex flex-col items-center"
             style={{ marginTop: `${candle.marginTop}px` }}
          >
             <div className={`w-[1px] h-10 ${color}`}></div>
             <div className={`w-3 ${color}`} style={{ height: `${candle.height}px` }}></div>
             <div className={`w-[1px] h-10 ${color}`}></div>
          </motion.div>
        )
      })}
    </div>
  );
};

// Floating Ticker Component for Pairs
const FloatingTicker = ({ delay, x, y, text, type }: { delay: number, x: string, y: string, text: string, type: 'forex' | 'crypto' }) => {
    const isForex = type === 'forex';
    const colorClass = isForex ? "text-blue-400 border-blue-500/30 bg-blue-500/10" : "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: [0, 0.7, 0], y: -60 }}
            transition={{ 
                duration: 8, 
                delay: delay,
                repeat: Infinity, 
                ease: "linear" 
            }}
            className={`absolute z-0 text-xs font-mono font-bold px-2 py-1 rounded border backdrop-blur-sm ${colorClass}`}
            style={{ left: x, top: y }}
        >
            {text}
        </motion.div>
    );
};

import PhoneFrame from "./PhoneFrame";

// ... (keep helper components)

export default function PromoVideo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // ... (keep useEffect logic)
    const timeline = [
      { time: 0, step: 0 },    // "Trading alone is hard"
      { time: 4000, step: 1 }, // "Winning consistently is harder"
      { time: 8000, step: 2 }, // Logo Reveal
      { time: 12000, step: 3 }, // Final CTA
    ];

    const timeouts = timeline.map((item) =>
      setTimeout(() => setStep(item.step), item.time)
    );

    const loopInterval = setInterval(() => {
      setStep(0);
      timeouts.forEach((t) => clearTimeout(t)); 
      timeline.forEach((item) => {
         setTimeout(() => setStep(item.step), item.time);
      });
    }, 15000);

    return () => {
      timeouts.forEach((t) => clearTimeout(t));
      clearInterval(loopInterval);
    };
  }, []);

  return (
      <PhoneFrame>
            {/* Background Ambience */}
            
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-red-900/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                {/* Chart Grid Line (Subtle) */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            </div>

            {/* Trading Visuals */}
            <CandlestickBackground />

            {/* Forex Pairs */}
            <FloatingTicker delay={0} x="10%" y="60%" text="GBP/USD" type="forex" />
            <FloatingTicker delay={2} x="70%" y="15%" text="EUR/USD" type="forex" />
            <FloatingTicker delay={4} x="20%" y="30%" text="USD/JPY" type="forex" />
            <FloatingTicker delay={1} x="60%" y="70%" text="AUD/USD" type="forex" />
            <FloatingTicker delay={5} x="80%" y="40%" text="USD/CHF" type="forex" />

            {/* Crypto Pairs */}
            <FloatingTicker delay={0.5} x="15%" y="80%" text="ETH/USD" type="crypto" />
            <FloatingTicker delay={2.5} x="80%" y="80%" text="SOL/USD" type="crypto" />
            <FloatingTicker delay={3.5} x="10%" y="20%" text="LTC/USD" type="crypto" />
            <FloatingTicker delay={1.5} x="65%" y="55%" text="XRP/USD" type="crypto" />


            {/* Chart Line Animation (Red for "Hard", Green for "Masters"?) */}
             <svg className="absolute w-full h-full inset-0 z-0 opacity-20 pointer-events-none">
                 <motion.path
                    d="M0,500 C50,450 100,550 150,400 C200,420 250,300 320,200"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                 />
                 <defs>
                     <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                         <stop offset="0%" stopColor="#ef4444" />
                         <stop offset="100%" stopColor="#22c55e" />
                     </linearGradient>
                 </defs>
             </svg>

            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div
                        key="step0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.8 }}
                        className="z-10 relative"
                    >
                         {/* Bearish visuals for "Hard" */}
                        <div className="mb-4 flex justify-center text-red-500 opacity-80">
                             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 5.5 5H18.5C20 5 22 7 22 9.5V17Z"/><path d="M12 15l-2-2-2 2"/><path d="M16 13l-2 2-2-2"/></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            Trading alone is <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">hard</span>.
                        </h2>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.8 }}
                        className="z-10 relative"
                    >
                         {/* Volatility visuals */}
                        <div className="mb-4 flex justify-center text-red-600 opacity-80">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 9 8.5 13.5 2 7"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            Winning consistently is <span className="text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">harder</span>.
                        </h2>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="z-10 flex flex-col items-center gap-6"
                    >
                         {/* Logo Placeholder */}
                         <motion.div
                            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                            className="relative w-32 h-32"
                         >
                             <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
                             <Image 
                                src="/images/logo.png" 
                                alt="MasterSync Logo" 
                                fill 
                                className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                             />
                         </motion.div>
                         
                         <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-4xl font-extrabold text-white tracking-tighter"
                         >
                            MasterSync
                         </motion.h1>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="z-10 flex flex-col items-center gap-8"
                    >
                         {/* Bullish signals */}
                        <div className="absolute -z-10 w-full h-full opacity-30">
                             <div className="absolute top-1/4 left-1/4 text-green-500 text-xs">BUY</div>
                             <div className="absolute bottom-1/3 right-1/4 text-green-500 text-xs">LONG</div>
                        </div>

                        <h2 className="text-4xl font-bold text-white leading-tight">
                            Trade Like <br/> The <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">Masters</span>.
                        </h2>
                        
                        {/* Welcome Message Message Bubble */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            className="bg-neutral-800/90 backdrop-blur border border-white/10 px-6 py-4 rounded-2xl rounded-tr-sm shadow-xl max-w-[80%]"
                        >
                            <p className="text-white text-lg font-medium">
                                👋 Hey, Welcome to <span className="text-red-500 font-bold">MasterSync</span>
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress Bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-gradient-to-r from-red-600 to-orange-500"
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 15, ease: "linear", repeat: Infinity }}
                />
            </div>

      </PhoneFrame>
  );
}
