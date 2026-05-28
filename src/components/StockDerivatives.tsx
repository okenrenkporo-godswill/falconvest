"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import Link from "next/link";
import { CandlestickChart, Landmark, Percent } from "lucide-react";

export default function StockDerivatives() {
  return (
    <section className="pt-24 pb-8 bg-white dark:bg-black transition-colors duration-500 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Hero-matched gradient container */}
        <div className="relative w-full rounded-[2.5rem] bg-gradient-to-br from-[#d4e5e9] via-[#eef4f5] to-white dark:from-[#1e3640] dark:via-[#0f1e23] dark:to-black border border-[#33525c]/10 p-8 md:p-16 text-left overflow-hidden">
          {/* Ambient light glow */}
          <div className="absolute right-0 top-0 w-[40%] h-[100%] bg-gradient-to-l from-white/30 dark:from-white/5 to-transparent pointer-events-none" />
          
          <div className="grid lg:grid-cols-3 gap-12 items-center relative z-10">
            
            {/* Left 2 Columns: Pitch copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-white/10 text-[#1e3640] dark:text-[#33525c] border border-white/80">
                <CandlestickChart size={14} className="text-[#33525c]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Global Derivatives Hub</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black text-[#1e3640] dark:text-white tracking-tighter leading-[1.05] uppercase">
                Trade Stock derivatives & futures
              </h2>
              
              <p className="text-lg text-[#33525c] dark:text-neutral-300 leading-relaxed font-medium">
                Access a Wide Range of Instruments — Trade options, futures, CFDs, and other premium stock derivatives across major global markets. Target global indices, elite blue-chip companies, and key agricultural/energy commodities at institutional pricing.
              </p>
              
              <div className="pt-2">
                <Button
                  as={Link}
                  href="/register"
                  className="bg-[#33525c] hover:bg-[#2a4550] text-white font-black h-14 px-10 text-sm uppercase tracking-widest rounded-full shadow-lg shadow-[#33525c]/25"
                >
                  Start Options Trading
                </Button>
              </div>
            </motion.div>

            {/* Right Column: Key benefits list */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-3xl p-8 border border-white/50 dark:border-white/5"
            >
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 text-[#33525c] flex items-center justify-center shrink-0 shadow-sm">
                  <Landmark size={18} />
                </div>
                <div>
                  <h4 className="font-black text-[#1e3640] dark:text-white text-sm uppercase tracking-tight">Major Exchanges</h4>
                  <p className="text-xs text-[#33525c]/80 dark:text-neutral-400 font-semibold leading-relaxed">Direct derivatives route to NYSE, NASDAQ, LSE, and Tokyo Stock Exchange.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start border-t border-black/5 dark:border-white/5 pt-6">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 text-[#33525c] flex items-center justify-center shrink-0 shadow-sm">
                  <Percent size={18} />
                </div>
                <div>
                  <h4 className="font-black text-[#1e3640] dark:text-white text-sm uppercase tracking-tight">Up to 1:500 Leverage</h4>
                  <p className="text-xs text-[#33525c]/80 dark:text-neutral-400 font-semibold leading-relaxed">Amplify your market positions with strict negative balance protection protocols.</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}
