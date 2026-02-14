"use client";

import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Zap, Target, Award, Users, BarChart3 } from "lucide-react";

const VALUES = [
  {
    icon: Shield,
    title: "Institutional Security",
    desc: "We apply the same level of security and compliance as tier-1 global banks."
  },
  {
    icon: Zap,
    title: "Ultra-Low Latency",
    desc: "Our infrastructure is built for high-frequency trading with sub-millisecond execution."
  },
  {
    icon: Target,
    title: "Precision Trading",
    desc: "Advanced order types and deep liquidity ensure your entries are pinpoint accurate."
  },
  {
    icon: Award,
    title: "Award Winning",
    desc: "Voted #1 for platform reliability and customer support 3 years in a row."
  },
  {
    icon: Users,
    title: "Community Driven",
    desc: "We build features based on the direct feedback of our global trading community."
  },
  {
    icon: BarChart3,
    title: "Deep Liquidity",
    desc: "Access institutional-grade liquidity pools for the tightest spreads in the market."
  }
];

export default function WhyMasterSync() {
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500">
      <Header />

      <main className="pt-32 pb-24">
        {/* HERO */}
        <section className="container mx-auto px-6 mb-32">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-1.5 rounded-full bg-[#FF6347]/10 text-[#FF6347] text-[10px] font-black uppercase tracking-[0.2em]"
            >
              Our Mission
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black text-black dark:text-white tracking-tighter uppercase leading-[0.9]"
            >
              Redefining <span className="text-[#FF6347] italic">Institutional</span> Trading.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 font-light leading-relaxed"
            >
              MasterSync was born from a simple realization: that professional-grade tools shouldn't be reserved for elite institutions. We've built a platform that combines bank-level security with the accessibility of modern fintech.
            </motion.p>
          </div>
        </section>

        {/* STATS BREADCRUMB STYLE */}
        <section className="bg-neutral-50 dark:bg-neutral-900/50 py-20 border-y border-black/5 dark:border-white/5 mb-32">
          <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <p className="text-4xl md:text-6xl font-black text-black dark:text-white mb-2">$500B+</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Trading Volume</p>
            </div>
            <div>
              <p className="text-4xl md:text-6xl font-black text-black dark:text-white mb-2">2M+</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Active Traders</p>
            </div>
            <div>
              <p className="text-4xl md:text-6xl font-black text-black dark:text-white mb-2">40+</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Licensed Regions</p>
            </div>
            <div>
              <p className="text-4xl md:text-6xl font-black text-black dark:text-white mb-2">99.9%</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Server Uptime</p>
            </div>
          </div>
        </section>

        {/* VALUES GRID */}
        <section className="container mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
             <h2 className="text-3xl md:text-5xl font-black text-black dark:text-white tracking-tight uppercase">Core Values</h2>
             <p className="text-neutral-500 max-w-xl mx-auto">The principles that guide every feature we build and every decision we make.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {VALUES.map((val, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[2.5rem] bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 hover:border-[#FF6347]/30 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#FF6347]/5 flex items-center justify-center text-[#FF6347] mb-8 group-hover:scale-110 transition-transform">
                  <val.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-4 uppercase tracking-tight">{val.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-500 leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
