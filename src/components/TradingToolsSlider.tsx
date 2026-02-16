"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";

// Protection Animation Component
const ProtectionAnimation = ({ t }: { t: any }) => {
    return (
        <div className="w-full h-full bg-white dark:bg-black relative overflow-hidden flex flex-col items-center justify-center p-8 transition-colors duration-500">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1]" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            {/* Chart Container */}
            <div className="relative w-full max-w-sm h-64 bg-neutral-50/80 dark:bg-neutral-900/80 rounded-xl border border-black/5 dark:border-white/10 backdrop-blur-sm p-4 overflow-hidden shadow-xl">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-4 border-b border-black/5 dark:border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-[#FF6347] animate-pulse"></div>
                         <span className="text-black dark:text-white text-xs font-bold">BTC/USD</span>
                    </div>
                    <span className="text-neutral-500 dark:text-neutral-400 text-xs text-[10px]">{t('protection.liveProtection')}</span>
                </div>

                {/* Take Profit Line (Target) */}
                <div className="absolute top-[25%] left-0 right-0 border-t border-dashed border-green-500/50 flex items-center justify-end px-2">
                    <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-1 rounded">{t('protection.tp')}: $48,500</span>
                </div>

                {/* Stop Loss Line (Protection) */}
                <div className="absolute bottom-[25%] left-0 right-0 border-t border-dashed border-red-500/50 flex items-center justify-end px-2 z-10">
                    <span className="text-[10px] text-red-500 font-bold bg-red-500/10 px-1 rounded">{t('protection.sl')}: $42,200</span>
                </div>

                {/* Chart Line Path */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                     <motion.path
                        d="M0,150 C50,140 80,160 120,130 C160,100 200,140 250,120 C300,100 350,180 400,190"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 1 }}
                     />
                     {/* Crash simulation line */}
                     <motion.path
                        d="M250,120 L300,200" 
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="3"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                        transition={{ duration: 2, delay: 2, repeat: Infinity, repeatDelay: 3 }}
                     />
                </svg>

                {/* Shield Activation */}
                <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, delay: 2.5, repeat: Infinity, repeatDelay: 3 }}
                    className="absolute bottom-[20%] left-1/2 -translate-x-1/2 bg-neutral-900/90 border border-green-500 text-green-500 px-3 py-1.5 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center gap-2 z-20"
                >
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                     <span className="text-xs font-bold whitespace-nowrap">{t('protection.balanceProtected')}</span>
                </motion.div>

            </div>

             {/* MasterSync Branding */}
             <div className="absolute bottom-6 flex flex-col items-center gap-1 opacity-50">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest">{t('protection.poweredBy')}</span>
                <div className="flex items-center gap-1.5 grayscale">
                    <div className="w-4 h-4 relative">
                         <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
                    </div>
                    <span className="text-black dark:text-white font-bold text-xs">MasterSync</span>
                </div>
            </div>
        </div>
    );
};

export default function TradingToolsSlider() {
  const t = useTranslations("TradingToolsSlider");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  const slides = [
    {
      id: 1,
      mediaType: "video",
      src: "/images/trading.mp4", 
    },
    {
      id: 2,
      mediaType: "video",
      src: "/images/view.mp4", 
    },
    {
      id: 3,
      mediaType: "animation",
      src: "",
    },
  ];

  useEffect(() => {
    const duration = 8000; // 8 seconds per slide
    const interval = 100; // Update every 100ms
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentSlide]);

  const handleDotClick = (index: number) => {
      setCurrentSlide(index);
      setProgress(0);
  };

  return (
    <section className="bg-transparent py-24 relative overflow-hidden transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          
          {/* Left Side: Text Content */}
          <div className="flex-1 space-y-8 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={slides[currentSlide].id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-[1px] bg-[#FF6347]"></div>
                    <span className="text-[#FF6347] font-bold uppercase tracking-wider text-sm">
                        {t(`slides.${currentSlide}.category`)}
                    </span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white leading-tight">
                  {t(`slides.${currentSlide}.title`)}
                </h2>
                
                <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed max-w-xl">
                  {t(`slides.${currentSlide}.description`)}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress / Navigation */}
            <div className="flex items-center gap-4 pt-8">
                {slides.map((_, index) => (
                    <button 
                      key={index}
                      onClick={() => handleDotClick(index)}
                      className="relative h-1 bg-neutral-100 rounded-full overflow-hidden transition-all duration-300"
                      style={{ width: currentSlide === index ? '48px' : '12px' }}
                    >
                        {currentSlide === index && (
                             <motion.div 
                                className="absolute top-0 left-0 h-full bg-[#FF6347]"
                                style={{ width: `${progress}%` }}
                             />
                        )}
                    </button>
                ))}
            </div>
          </div>

          {/* Right Side: Media Display */}
          <div className="flex-1 w-full max-w-[600px] lg:max-w-none relative aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden border border-neutral-100 shadow-xl bg-neutral-50 group">
             
             {/* Branding Overlay (Only for non-animation slides to avoid double branding) */}
             {slides[currentSlide].mediaType !== 'animation' && (
                 <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-200">
                    <div className="w-5 h-5 relative">
                        <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
                    </div>
                    <span className="text-neutral-900 font-bold text-xs">MasterSync</span>
                 </div>
             )}

             <AnimatePresence mode="wait">
                <motion.div
                    key={slides[currentSlide].id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full"
                >
                    {slides[currentSlide].mediaType === "video" ? (
                        <video 
                            src={slides[currentSlide].src}
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : slides[currentSlide].mediaType === "animation" ? (
                        <ProtectionAnimation t={t} />
                    ) : (
                        <div className="w-full h-full relative">
                             {/* Placeholder pattern if image missing */}
                             <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
                                 <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-neutral-700"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                             </div>
                             {slides[currentSlide].src && (
                                <Image 
                                    src={slides[currentSlide].src} 
                                    alt={t(`slides.${currentSlide}.title`)} 
                                    fill 
                                    className="object-cover"
                                />
                             )}
                        </div>
                    )}

                    {/* Gradient Overlay for Text Readability if needed, mostly for bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none opacity-60" />
                </motion.div>
             </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
