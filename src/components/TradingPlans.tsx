"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import Link from "next/link";
import { Check, Shield, Zap, Crown, Target } from "lucide-react";
import { useTranslations } from "next-intl";

export default function TradingPlans() {
  const t = useTranslations("TradingPlans");

  const PLANS = [
    {
      name: t('plans.bronze.name'),
      price: "250",
      icon: Shield,
      color: "from-neutral-400 to-neutral-600",
      features: [
        t('plans.bronze.features.pairs'),
        t('plans.bronze.features.leverage'),
        t('plans.bronze.features.spreads'),
        t('plans.bronze.features.execution'),
        t('plans.bronze.features.support')
      ],
      highlight: false
    },
    {
      name: t('plans.silver.name'),
      price: "1,000",
      icon: Target,
      color: "from-slate-400 to-slate-200",
      features: [
        t('plans.silver.features.pairs'),
        t('plans.silver.features.leverage'),
        t('plans.silver.features.spreads'),
        t('plans.silver.features.execution'),
        t('plans.silver.features.manager')
      ],
      highlight: false
    },
    {
      name: t('plans.gold.name'),
      price: "5,000",
      icon: Crown,
      color: "from-yellow-400 to-amber-600",
      features: [
        t('plans.gold.features.pairs'),
        t('plans.gold.features.swap'),
        t('plans.gold.features.leverage'),
        t('plans.gold.features.spreads'),
        t('plans.gold.features.trading'),
        t('plans.gold.features.insights')
      ],
      highlight: true
    },
    {
      name: t('plans.premium.name'),
      price: "20,000",
      icon: Zap,
      color: "from-purple-500 to-indigo-600",
      features: [
        t('plans.premium.features.pairs'),
        t('plans.premium.features.spreads'),
        t('plans.premium.features.commissions'),
        t('plans.premium.features.events'),
        t('plans.premium.features.concierge'),
        t('plans.premium.features.risk')
      ],
      highlight: false
    }
  ];

  return (
    <section className="relative w-full py-32 px-4 bg-transparent overflow-hidden transition-colors duration-500">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#33525c]/5 rounded-full blur-[120px] -z-10" />
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
            {t('headline.prefix')} <span className="text-[#33525c]">{t('headline.suffix')}</span>
          </motion.h2>
          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
             className="text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            {t('description')}
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
              className={`relative flex flex-col p-7 rounded-[2.5rem] border transition-all duration-300 group ${
                plan.highlight 
                  ? "bg-white dark:bg-[#111111] border-[#33525c]/30 shadow-xl shadow-[#33525c]/10" 
                  : "bg-white dark:bg-neutral-900/40 border-black/5 dark:border-white/5 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:border-black/10 dark:hover:border-white/10 shadow-sm dark:shadow-none"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#33525c] text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg shadow-[#33525c]/30 tracking-widest">
                  {t('mostPopular')}
                </div>
              )}

              {/* Icon & Name */}
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3.5 rounded-xl bg-gradient-to-br ${plan.color} bg-opacity-10 flex items-center justify-center text-white`}>
                  <plan.icon size={24} className="drop-shadow-lg" />
                </div>
                <h3 className="text-xl font-black text-black dark:text-white uppercase tracking-tight leading-normal">{plan.name}</h3>
              </div>

              {/* Price */}
              <div className="mb-10">
                <p className="text-neutral-900 dark:text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1">{t('minimumFunding')}</p>
                <div className="flex items-baseline">
                  <span className="text-4xl lg:text-5xl font-black text-black dark:text-white tracking-tighter">
                    ${plan.price}
                  </span>
                  <span className="text-neutral-900 dark:text-neutral-500 text-2xl font-bold ml-1">.00</span>
                </div>
              </div>

              {/* Features List */}
              <div className="flex-1 space-y-3 mb-6">
                {plan.features.map((feature, fidx) => (
                  <div key={fidx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#33525c]/10 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-[#33525c]" />
                    </div>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium group-hover:text-black dark:group-hover:text-neutral-300 transition-colors">
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
                size="md"
                className={`h-14 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.15em] transition-all transform active:scale-95 ${
                  plan.highlight
                    ? "bg-[#33525c] text-white shadow-lg shadow-[#33525c]/20 hover:bg-[#2a4550]"
                    : "bg-black/5 dark:bg-white/5 text-black dark:text-white hover:bg-[#33525c] hover:text-white border border-black/5 dark:border-white/5 hover:border-transparent"
                }`}
              >
                {t('fundPlan')}
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
          <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-transparent via-[#33525c]/20 to-transparent">
             <div className="px-8 py-3 rounded-xl bg-black/60 backdrop-blur-sm border border-white/5">
                <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono italic tracking-wide">
                   {t('disclaimer')}
                </p>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
