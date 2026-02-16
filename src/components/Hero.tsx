"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/react";
import Link from "next/link";
import PromoVideo from "./PromoVideo";
import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("Hero");
  const [index, setIndex] = React.useState(0);
  const headlinesCount = 4; // We have 4 headlines defined in messages

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % headlinesCount);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section 
      className="relative w-full flex flex-col items-center bg-white dark:bg-black transition-colors duration-500 overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none z-0" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#FF6347]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-[#FF6347]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Grid */}
      <div className="container mx-auto px-6 lg:px-12 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Text Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-start text-left space-y-8 lg:max-w-2xl"
        >
           {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6347] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6347]"></span>
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-800 dark:text-neutral-300 uppercase">
               {t('badge')}
            </span>
          </div>
 
          {/* Cycling Headline */}
          <div className="h-[120px] md:h-[160px] flex flex-col justify-center relative z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-1"
              >
                <h1 className="text-5xl md:text-7xl font-black text-black dark:text-white tracking-tighter leading-[0.95]">
                  {t(`headlines.${index}.part1`)}
                </h1>
                <h1 className="text-5xl md:text-7xl font-black text-[#FF6347] tracking-tighter leading-[0.95] relative inline-block">
                  {t(`headlines.${index}.part2`)}
                   {/* Underline decoration */}
                   <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#FF6347] opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                   </svg>
                </h1>
              </motion.div>
            </AnimatePresence>
          </div>
 
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium max-w-lg">
            {t.rich('subtitle', {
              bold: (chunks) => <span className="text-black dark:text-white font-bold decoration-[#FF6347]/50 underline underline-offset-4 decoration-2">{chunks}</span>
            })}
          </p>
 
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
            <Button 
              as={Link}
              href="/register"
              className="bg-[#FF6347] text-white font-black h-14 px-10 text-sm uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-xl shadow-[#FF6347]/25 w-full sm:w-auto"
            >
              {t('startFree')}
            </Button>
            <Button 
              as={Link}
              href="/register"
              variant="bordered"
              className="border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 h-14 px-10 text-sm uppercase tracking-widest rounded-full backdrop-blur-sm w-full sm:w-auto"
            >
              {t('copyTradeNow')}
            </Button>
          </div>

          {/* Social Proof / Stats */}
           <div className="flex gap-8 pt-8 border-t border-black/5 dark:border-white/5 w-full">
              <div>
                <p className="text-2xl font-black text-black dark:text-white">24/7</p>
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">{t('stats.uptime')}</p>
              </div>
              <div>
                <p className="text-2xl font-black text-black dark:text-white">$500M+</p>
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">{t('stats.volume')}</p>
              </div>
              <div>
                <p className="text-2xl font-black text-black dark:text-white">0.05s</p>
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">{t('stats.latency')}</p>
              </div>
           </div>
        </motion.div>

        {/* Right Column: Dashboard + Mobile App Composition */}
        <motion.div 
           initial={{ opacity: 0, x: 30 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
           className="relative mt-12 lg:mt-0 lg:h-[700px] flex items-center justify-center pointer-events-none select-none"
        >
           {/* Glow behind visual */}
           <div className="absolute inset-0 bg-[#FF6347]/10 blur-[100px] -z-10 rounded-full" />

           {/* Dashboard Placeholder (Desktop View) */}
           <div className="relative w-full max-w-lg aspect-video bg-neutral-900 rounded-xl border border-neutral-800 shadow-2xl overflow-hidden hidden lg:block transform -rotate-3 hover:rotate-0 transition-transform duration-700">
               {/* Top Bar */}
               <div className="h-8 bg-neutral-800 border-b border-neutral-700 flex items-center px-4 gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
               </div>
               {/* UI Mockup Content - Abstract */}
               <div className="p-4 grid grid-cols-4 gap-4 h-full opacity-50">
                  <div className="col-span-1 bg-neutral-800 rounded h-3/4 animate-pulse" />
                  <div className="col-span-3 grid grid-rows-3 gap-4">
                      <div className="bg-neutral-800 rounded h-full w-full" />
                      <div className="bg-neutral-800 rounded h-full w-2/3" />
                      <div className="bg-neutral-800 rounded h-full w-full" />
                  </div>
               </div>
               {/* Center text for placeholder */}
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-neutral-700 font-bold text-lg tracking-widest uppercase">{t('dashboardPlaceholder')}</span>
               </div>
           </div>

           {/* Mobile App View (PromoVideo) - Floating over/next to dashboard */}
           <div className="lg:absolute lg:-bottom-10 lg:-right-10 lg:scale-[0.8] z-20 origin-bottom-right">
               <PromoVideo />
           </div>
        </motion.div>

      </div>

      {/* Full Width Video Showcase Section */}
     

    </section>
  );
}
