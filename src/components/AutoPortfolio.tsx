"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import PhoneFrame from "./PhoneFrame";

export default function AutoPortfolio() {
  const [balance, setBalance] = useState(12450.00);
  
  // Simulate balance growth
  useEffect(() => {
    const interval = setInterval(() => {
        setBalance(prev => prev + (Math.random() * 5));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full py-24 px-4 overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-purple-900/20 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24">
        
        {/* Left Side: Text Content */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-6 max-w-xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold text-white tracking-tight"
          >
            Automated <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Portfolio</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
             className="text-lg text-neutral-400"
          >
            Experience the future of asset management. Watch your portfolio grow with our advanced automated trading algorithms.
            Set your strategy, sync with master traders, and let the system handle the rest.
          </motion.p>
        </div>

        {/* Right Side: Animated Phone Display */}
        <div className="relative z-10 flex-shrink-0 scale-90 md:scale-100">
             <PhoneFrame>
                {/* Background */}
                <div className="absolute inset-0 bg-neutral-950 flex flex-col p-4 pt-12">
                   
                   {/* Header: Logo & User */}
                   <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-2">
                           <div className="w-6 h-6 relative">
                               <Image src="/images/logo1.png" alt="Logo" fill className="object-contain" />
                           </div>
                           <span className="text-white font-bold text-sm">FalconVest</span>
                       </div>
                       <div className="w-10 h-10 rounded-full bg-neutral-800 border-2 border-green-500 p-0.5 overflow-hidden shadow-lg shadow-green-500/20">
                           <div className="w-full h-full rounded-full bg-neutral-700 relative">
                               <Image src="/images/port.png" alt="Profile" fill className="object-cover" />
                           </div>
                       </div>
                   </div>

                   {/* Balance Card */}
                   <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/5 rounded-2xl p-5 mb-6 text-left shadow-lg relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-3 opacity-20 text-purple-500">
                           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                       </div>
                       <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-1">Total Balance</p>
                       <h3 className="text-3xl font-bold text-white mb-2">
                           ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </h3>
                       <div className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-500/10 px-2 py-0.5 rounded-full w-fit">
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                           <span>+24.5%</span>
                       </div>
                   </div>

                   {/* Active Positions List (Scrollable) */}
                   <div className="flex-1 overflow-y-auto no-scrollbar mask-gradient-b">
                       <div className="flex items-center justify-between mb-4 sticky top-0 bg-neutral-950/95 backdrop-blur z-10 py-2">
                           <h4 className="text-white font-bold text-sm">Active Positions</h4>
                           <span className="text-[10px] text-green-400 bg-green-900/20 border border-green-500/20 px-2 py-0.5 rounded-full animate-pulse">● Live Sync</span>
                       </div>

                       <div className="space-y-3 pb-4">
                           {/* Position Items Helper */}
                           {[
                             { symbol: "GBP/USD", name: "British Pound", type: "Forex", profit: "+$540.20", amt: "1.5 Lot", icon: "£", color: "text-blue-400 bg-blue-400/10" },
                             { symbol: "ETH/USD", name: "Ethereum", type: "Crypto", profit: "+$856.20", amt: "4.2 ETH", icon: "Ξ", color: "text-purple-400 bg-purple-400/10" },
                             { symbol: "EUR/USD", name: "Euro", type: "Forex", profit: "+$320.50", amt: "1.0 Lot", icon: "€", color: "text-blue-400 bg-blue-400/10" },
                             { symbol: "SOL/USD", name: "Solana", type: "Crypto", profit: "+$1,240.00", amt: "145 SOL", icon: "◎", color: "text-purple-400 bg-purple-400/10" },
                             { symbol: "USD/JPY", name: "Yen", type: "Forex", profit: "+$210.10", amt: "0.8 Lot", icon: "¥", color: "text-blue-400 bg-blue-400/10" },
                             { symbol: "LTC/USD", name: "Litecoin", type: "Crypto", profit: "+$145.30", amt: "15 LTC", icon: "Ł", color: "text-purple-400 bg-purple-400/10" },
                             { symbol: "AUD/USD", name: "Aust. Dollar", type: "Forex", profit: "+$180.90", amt: "0.5 Lot", icon: "$", color: "text-blue-400 bg-blue-400/10" },
                             { symbol: "USD/CHF", name: "Swiss Franc", type: "Forex", profit: "+$95.40", amt: "0.3 Lot", icon: "₣", color: "text-blue-400 bg-blue-400/10" },
                           ].map((item, i) => (
                               <motion.div 
                                    key={i}
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                    className="flex items-center justify-between bg-neutral-900/50 border border-white/5 p-3 rounded-xl hover:bg-white/5 transition-colors"
                                >
                                   <div className="flex items-center gap-3">
                                       <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${item.color}`}>
                                           {item.icon}
                                       </div>
                                       <div className="text-left">
                                           <p className="text-white text-xs font-bold">{item.symbol}</p>
                                           <p className="text-neutral-500 text-[10px]">{item.name} • Long</p>
                                       </div>
                                   </div>
                                   <div className="text-right">
                                       <p className="text-green-500 text-xs font-bold">{item.profit}</p>
                                       <p className="text-neutral-500 text-[10px]">{item.amt}</p>
                                   </div>
                               </motion.div>
                           ))}
                       </div>
                   </div>

                   {/* Footer Nav Simulation */}
                   <div className="mt-4 pt-4 border-t border-white/5 flex justify-around opacity-50">
                       <div className="w-6 h-6 rounded-full bg-neutral-800"></div>
                       <div className="w-6 h-6 rounded-full bg-white scale-110"></div>
                       <div className="w-6 h-6 rounded-full bg-neutral-800"></div>
                       <div className="w-6 h-6 rounded-full bg-neutral-800"></div>
                   </div>

                </div>
             </PhoneFrame>
        </div>
      </div>
    </section>
  );
}
