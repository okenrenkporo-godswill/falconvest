"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass, BarChart4, Zap, BellRing } from "lucide-react";

export default function FeatureHighlights() {
  const features = [
    {
      title: "Fast, Seamless Navigation",
      desc: "An intuitive workspace designed to make switching between markets, copying professionals, and managing your funds quick and frictionless.",
      icon: <Compass size={24} className="text-white" />,
      color: "bg-[#33525c]",
    },
    {
      title: "Powerful Built-In Charts",
      desc: "Access 100+ standard indicators, real-time drawing instruments, and custom TradingView elements natively within your broker terminal.",
      icon: <BarChart4 size={24} className="text-white" />,
      color: "bg-blue-600",
    },
    {
      title: "Lightning-Fast Execution",
      desc: "All trade orders are executed under 0.05 seconds directly with leading global liquidity providers, preventing slippage and securing optimal entries.",
      icon: <Zap size={24} className="text-white" />,
      color: "bg-purple-600",
    },
    {
      title: "Real-Time Data & Smart Alerts",
      desc: "Receive immediate updates on market anomalies, technical breaks, and master trader actions directly via in-app push notifications.",
      icon: <BellRing size={24} className="text-white" />,
      color: "bg-green-600",
    },
  ];

  return (
    <section className="py-24 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 overflow-hidden border-t border-black/5 dark:border-white/5">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#33525c]">Built For Sophistication</p>
          <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter">Feature Highlights</h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium">
            Everything you need to trade stocks, crypto, forex, and derived indices on a single high-performance engine.
          </p>
        </div>

        {/* 2x2 Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-[2rem] p-8 md:p-12 flex gap-8 items-start hover:border-[#33525c]/25 transition-all shadow-sm duration-300 group"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center shrink-0 shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <div className="space-y-3 text-left">
                <h3 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-base font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
