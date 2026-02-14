"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import Link from "next/link";
import { Check, Shield, Zap, Crown, Target } from "lucide-react";

const PLANS = [
  {
    name: "Bronze",
    price: "1,000",
    icon: Shield,
    color: "from-neutral-400 to-neutral-600",
    features: [
      "200+ Trading Pairs",
      "Leverage up to 1:500",
      "Spreads from 1.2 pips",
      "Standard Execution",
      "24/5 Customer Support"
    ],
    highlight: false
  },
  {
    name: "Silver",
    price: "30,000",
    icon: Target,
    color: "from-slate-400 to-slate-200",
    features: [
      "300+ Trading Pairs",
      "Leverage up to 1:500",
      "Spreads from 0.8 pips",
      "Priority Execution",
      "Dedicated Account Manager"
    ],
    highlight: false
  },
  {
    name: "Gold",
    price: "100,000",
    icon: Crown,
    color: "from-yellow-400 to-amber-600",
    features: [
      "400+ Trading Pairs",
      "No Swap Fees",
      "Leverage up to 1:500",
      "Spreads from 0.8 pips",
      "Direct ECN Trading",
      "Exclusive Market Insights"
    ],
    highlight: true
  },
  {
    name: "Premium",
    price: "500,000",
    icon: Zap,
    color: "from-purple-500 to-indigo-600",
    features: [
      "Unlimited Trading Pairs",
      "Institutional Spreads",
      "Ultra-Low Commissions",
      "VIP Events Access",
      "Personal Trading Concierge",
      "Advanced Risk Management"
    ],
    highlight: false
  }
];

export default function TradingPlans() {
  return (
    <section className="relative w-full py-32 px-4 bg-transparent overflow-hidden transition-colors duration-500">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF6347]/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-24 space-y-6">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-black dark:text-white uppercase tracking-tighter"
          >
            A TRADING PLAN <span className="text-[#FF6347]">FOR EVERY ONE</span>
          </motion.h2>
          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
             className="text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            We offer a variety of trading accounts to match every trading style across all levels of experience. 
            Whether you’re a scalper or day trader, we have you covered.
          </motion.p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -12 }}
              className={`relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500 group ${
                plan.highlight 
                  ? "bg-white dark:bg-[#111111] border-[#FF6347]/30 shadow-[0_20px_50px_rgba(255,99,71,0.15)]" 
                  : "bg-white dark:bg-neutral-900/40 border-black/5 dark:border-white/5 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:border-black/10 dark:hover:border-white/10 shadow-sm dark:shadow-none"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FF6347] text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-[0_4px_20px_rgba(255,99,71,0.4)] tracking-widest">
                  Most Popular
                </div>
              )}

              {/* Icon & Name */}
              <div className="flex items-center justify-between mb-8">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${plan.color} bg-opacity-10 flex items-center justify-center text-white`}>
                  <plan.icon size={28} className="drop-shadow-lg" />
                </div>
                <h3 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight">{plan.name}</h3>
              </div>

              {/* Price */}
              <div className="mb-10">
                <p className="text-neutral-900 dark:text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1">Minimum Funding</p>
                <div className="flex items-baseline">
                  <span className="text-4xl lg:text-5xl font-black text-black dark:text-white tracking-tighter">
                    ${plan.price}
                  </span>
                  <span className="text-neutral-900 dark:text-neutral-500 text-2xl font-bold ml-1">.00</span>
                </div>
              </div>

              {/* Features List */}
              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature, fidx) => (
                  <div key={fidx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#FF6347]/10 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-[#FF6347]" />
                    </div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium group-hover:text-black dark:group-hover:text-neutral-300 transition-colors">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action */}
              <Button
                as={Link}
                href="/register"
                fullWidth
                size="lg"
                className={`h-16 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.15em] transition-all transform active:scale-95 ${
                  plan.highlight
                    ? "bg-[#FF6347] text-white shadow-[0_10px_25px_-5px_rgba(255,99,71,0.5)] hover:bg-[#e05035]"
                    : "bg-black/5 dark:bg-white/5 text-black dark:text-white hover:bg-[#FF6347] hover:text-white border border-black/5 dark:border-white/5 hover:border-transparent"
                }`}
              >
                Fund Plan
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Bottom Disclaimer/Elegant Note */}
        <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           className="mt-20 text-center"
        >
          <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-transparent via-[#FF6347]/20 to-transparent">
             <div className="px-8 py-3 rounded-xl bg-black/60 backdrop-blur-sm border border-white/5">
                <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono italic tracking-wide">
                   * All trading accounts are subject to real-time market risk. Institutional liquidity providers verify all Premium funding.
                </p>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
