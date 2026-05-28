"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe, Users, ArrowLeftRight, Wallet, RotateCw } from "lucide-react";

export default function StatsSection() {
  const stats = [
    {
      title: "130+ Countries",
      desc: "We support global accessibility, so traders from all over the world can enjoy and profit anytime.",
      icon: <Globe size={24} className="text-[#33525c]" />,
    },
    {
      title: "1M+ Trader Accounts",
      desc: "An active community of over one million global accounts backing our liquidity models daily.",
      icon: <Users size={24} className="text-[#33525c]" />,
    },
    {
      title: "30M+ Monthly Transactions",
      desc: "High-frequency, sub-millisecond execution processing millions of operations securely.",
      icon: <ArrowLeftRight size={24} className="text-[#33525c]" />,
    },
    {
      title: "$16M+ Avg. Monthly Payouts",
      desc: "Committed to prompt withdrawals and continuous settlement for all tier levels.",
      icon: <Wallet size={24} className="text-[#33525c]" />,
    },
    {
      title: "$211M Monthly Turnover",
      desc: "Strong institutional backing providing deep market capitalization and continuous trading volumes.",
      icon: <RotateCw size={24} className="text-[#33525c]" />,
    },
  ];

  return (
    <section className="py-20 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 overflow-hidden border-t border-black/5 dark:border-white/5">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#33525c]">Continuous Growth</p>
          <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter">Falcon by the Numbers</h2>
        </div>

        {/* 5-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-[#eef4f5] dark:bg-[#1e3640] border border-[#33525c]/10 rounded-3xl p-6 flex flex-col justify-between hover:border-[#33525c]/30 transition-all shadow-sm group hover:-translate-y-1 duration-300 min-h-[240px]"
            >
              <div className="w-11 h-11 rounded-xl bg-white dark:bg-neutral-900 border border-[#33525c]/10 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="space-y-2 text-left">
                <h3 className="text-lg font-black text-[#2a4550] dark:text-white tracking-tight leading-snug uppercase">
                  {stat.title}
                </h3>
                <p className="text-xs text-[#33525c]/90 dark:text-neutral-400 font-medium leading-relaxed">
                  {stat.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
