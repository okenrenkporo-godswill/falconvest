"use client";

import React from "react";
import { motion } from "framer-motion";

interface PageHeroProps {
  title: string;
  subtitle: string;
  badge?: string;
  compact?: boolean;
}

export default function PageHero({ title, subtitle, badge, compact = true }: PageHeroProps) {
  return (
    <section className={`relative overflow-hidden bg-white dark:bg-black transition-colors duration-500 ${compact ? 'py-16 md:py-20' : 'py-24 md:py-32'}`}>
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-[#33525c]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[100%] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#33525c]/20 bg-[#33525c]/5 mb-6">
              <span className="text-[10px] font-black tracking-widest text-[#33525c] uppercase">{badge}</span>
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter leading-none mb-6">
            {title} <span className="text-[#33525c]">.</span>
          </h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-xl">
            {subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
