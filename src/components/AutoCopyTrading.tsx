"use client";

import React from "react";
import { motion } from "framer-motion";
import PhoneFrame from "./PhoneFrame";
import Image from "next/image";
import Link from "next/link";

// Helper component for the Dashboard Content inside phones
const PhoneDashboardContent = ({ 
    type, 
    balance = 12450.00, 
    profit = "+24.5%", 
    isMaster = false,
    showSignal = false 
}: { 
    type: string; 
    balance?: number; 
    profit?: string; 
    isMaster?: boolean;
    showSignal?: boolean;
}) => {
    const [liveBalance, setLiveBalance] = React.useState(balance);

    React.useEffect(() => {
        const interval = setInterval(() => {
             // Add random small amount to simulate live profit
            setLiveBalance(prev => prev + (Math.random() * 0.85));
        }, 80);
        return () => clearInterval(interval);
    }, []);

    return (
    <div className="absolute inset-0 bg-neutral-950 flex flex-col p-4 pt-12 overflow-hidden">
        
        {/* Header: Logo & User */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 relative">
                    <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
                </div>
                <span className="text-white font-bold text-sm">MasterSync</span>
            </div>
            
            {isMaster ? (
                 <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center font-bold text-black text-lg shadow-[0_0_15px_rgba(234,179,8,0.4)] border-2 border-white">M</div>
            ) : (
                <div className="w-10 h-10 rounded-full bg-neutral-800 border-2 border-green-500 p-0.5 overflow-hidden shadow-lg shadow-green-500/20">
                    <div className="w-full h-full rounded-full bg-neutral-700 relative">
                        <Image src="/images/port.png" alt="Profile" fill className="object-cover" />
                    </div>
                </div>
            )}
        </div>

        {/* Balance Card */}
        <div className={`bg-gradient-to-br ${isMaster ? 'from-yellow-900/40 to-yellow-800/20 border-yellow-500/30' : 'from-neutral-900 to-neutral-800 border-white/5'} border rounded-2xl p-5 mb-6 text-left shadow-lg relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-3 opacity-20 text-purple-500">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-1">{isMaster ? "Master Balance" : "Total Balance"}</p>
            <h3 className="text-3xl font-bold text-white mb-2">
                ${liveBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-500/10 px-2 py-0.5 rounded-full w-fit">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                <span>{profit}</span>
            </div>
            {isMaster && (
                <div className="absolute bottom-2 right-2 text-[10px] items-center gap-1 flex text-yellow-500 font-bold bg-yellow-500/10 px-2 py-1 rounded">
                    <span>👑 PRO TRADER</span>
                </div>
            )}
        </div>

        {/* Active Positions Section */}
        <div className="flex-1 overflow-y-auto no-scrollbar mask-gradient-b">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-neutral-950/95 backdrop-blur z-10 py-2">
                <h4 className="text-white font-bold text-sm">Active Positions</h4>
                <span className="text-[10px] text-[#FF6347] bg-[#FF6347]/5 border border-[#FF6347]/10 px-2 py-0.5 rounded-full animate-pulse font-bold">● Live Sync</span>
            </div>

            <div className="space-y-3 pb-4">
               {/* Show signal if master, or just list */}
               {showSignal && (
                   <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                        className="absolute inset-0 bg-blue-500/10 z-0 pointer-events-none"
                   />
               )}
               
               {[
                 { symbol: "GBP/USD", name: "British Pound", type: "Forex", profit: "+$540.20", amt: "1.5 Lot", icon: "£", color: "text-blue-400 bg-blue-400/10" },
                 { symbol: "ETH/USD", name: "Ethereum", type: "Crypto", profit: "+$856.20", amt: "4.2 ETH", icon: "Ξ", color: "text-purple-400 bg-purple-400/10" },
                 { symbol: "EUR/USD", name: "Euro", type: "Forex", profit: "+$320.50", amt: "1.0 Lot", icon: "€", color: "text-blue-400 bg-blue-400/10" },
                 { symbol: "SOL/USD", name: "Solana", type: "Crypto", profit: "+$1,240.00", amt: "145 SOL", icon: "◎", color: "text-purple-400 bg-purple-400/10" },
               ].map((item, i) => (
                   <motion.div 
                        key={i}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                        className={`flex items-center justify-between border  p-3 rounded-xl hover:bg-white/5 transition-colors relative z-10 ${showSignal && i===0 ? 'bg-green-500/10 border-green-500/30' : 'bg-neutral-900/50 border-white/5'}`}
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
                           <p className="text-[#FF6347] text-xs font-bold">{item.profit}</p>
                           <p className="text-neutral-500 text-[10px]">{item.amt}</p>
                       </div>
                   </motion.div>
               ))}
           </div>
        </div>

        {/* Footer Nav Simulation */}
        <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-around opacity-50 relative z-20 bg-white p-2 rounded-2xl mb-2">
           <div className="w-6 h-6 rounded-full bg-neutral-100"></div>
           <div className="w-6 h-6 rounded-full bg-[#FF6347] scale-110 shadow-md"></div>
           <div className="w-6 h-6 rounded-full bg-neutral-100"></div>
           <div className="w-6 h-6 rounded-full bg-neutral-100"></div>
       </div>

    </div>
    );
};

export default function AutoCopyTrading() {
  return (
    <section className="relative w-full py-24 px-4 overflow-hidden bg-transparent">
      
      {/* Container */}
      <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8">
            
            {/* Left Side: Animation Container (Phones + Flying Coins) */}
            <div className="relative flex-1 flex items-center justify-center gap-2 lg:gap-4 scale-50 md:scale-65 lg:scale-75 origin-center min-h-[400px]">
                
                {/* Phone 1: Master */}
                <motion.div 
                    initial={{ x: -20, opacity: 0, rotate: -10 }}
                    whileInView={{ x: 0, opacity: 1, rotate: 5 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 origin-bottom-right"
                >
                    <PhoneFrame>
                        <PhoneDashboardContent type="master" balance={84250.00} profit="+450%" isMaster={true} />
                    </PhoneFrame>
                </motion.div>

                {/* Central Animation Zone */}
                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                     
 

                    {/* Flying Coin: Bitcoin */}
                    <motion.div
                        initial={{ x: -100, y: 0, opacity: 0, scale: 0.5 }}
                        whileInView={{ 
                            x: [ -100, 0, 100 ], 
                            y: [ 0, -50, 0 ],
                            opacity: [0, 1, 1, 0],
                            scale: [0.5, 1.2, 0.5],
                            rotate: [0, 180, 360]
                        }}
                        transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            repeatDelay: 0.5
                        }}
                        className="absolute w-10 h-10 rounded-full bg-[#FF6347] border-2 border-white shadow-[0_0_20px_rgba(255,99,71,0.5)] z-30 flex items-center justify-center text-white font-bold text-lg"
                    >
                        ₿
                    </motion.div>

                    {/* Flying Coin: Tron (TRX) */}
                    <motion.div
                        initial={{ x: -100, y: 0, opacity: 0, scale: 0.5 }}
                        whileInView={{ 
                            x: [ -100, 0, 100 ], 
                            y: [ 0, 50, 0 ], // Curves below
                            opacity: [0, 1, 1, 0],
                            scale: [0.5, 1.2, 0.5],
                            rotate: [0, -180, -360]
                        }}
                        transition={{ 
                            duration: 2.5, 
                            delay: 1.25, // Staggered
                            repeat: Infinity, 
                            ease: "easeInOut",
                            repeatDelay: 0.5
                        }}
                        className="absolute w-10 h-10 rounded-full bg-[#FF6347] border-2 border-white shadow-[0_0_20px_rgba(255,99,71,0.5)] z-30 flex items-center justify-center text-white font-bold text-[10px]"
                    >
                        TRX
                    </motion.div>

                </div>

                {/* Phone 2: User */}
                <motion.div 
                    initial={{ x: 20, opacity: 0, rotate: 10 }}
                    whileInView={{ x: 0, opacity: 1, rotate: -5 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 origin-bottom-left"
                >
                    <PhoneFrame>
                        <PhoneDashboardContent type="user" balance={12450.00} profit="+24.5%" isMaster={false} showSignal={true} />
                    </PhoneFrame>
                </motion.div>

            </div>

            {/* Right Side: Text Content */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 max-w-xl z-20">
                <motion.h2 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-5xl md:text-7xl font-bold text-black dark:text-white tracking-tight leading-[1.1]"
                >
                    Introducing <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6347] to-[#e05035]">Autocopy</span>
                </motion.h2>

                <motion.p 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed"
                >
                    Learn, copy, and trade in one click. Tap into the experience of others and collaborate with a growing community of traders.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <Link href="/register">
                        <button className="bg-[#FF6347] hover:bg-[#e05035] text-white text-lg font-bold px-8 py-4 rounded-xl shadow-lg shadow-[#FF6347]/20 transition-all transform hover:-translate-y-1">
                            Try MasterSync Autocopy
                        </button>
                    </Link>
                </motion.div>
            </div>
      </div>
    </section>
  );
}

