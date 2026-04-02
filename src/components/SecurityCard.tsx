"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Fingerprint, Eye, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function SecurityCard() {
  const t = useTranslations("SecurityCard");

  const securityFeatures = [
    {
      icon: <Lock className="text-[#01C1D6]" size={28} />,
      title: t('securityFeatures.0.title'),
      desc: t('securityFeatures.0.desc')
    },
    {
      icon: <Shield className="text-[#01C1D6]" size={28} />,
      title: t('securityFeatures.1.title'),
      desc: t('securityFeatures.1.desc')
    },
    {
      icon: <Fingerprint className="text-[#01C1D6]" size={28} />,
      title: t('securityFeatures.2.title'),
      desc: t('securityFeatures.2.desc')
    },
    {
      icon: <Eye className="text-[#01C1D6]" size={28} />,
      title: t('securityFeatures.3.title'),
      desc: t('securityFeatures.3.desc')
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-black transition-colors duration-500 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-[#01C1D6]/5 rounded-full blur-[120px] pointer-events-none opacity-50" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">
          
          {/* Left Side: Visual Card */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative z-10 bg-neutral-50 dark:bg-neutral-900/50 border border-black/5 dark:border-white/5 rounded-2xl sm:rounded-[2rem] md:rounded-[3rem] p-5 sm:p-6 md:p-8 lg:p-12 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6 md:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-[#01C1D6]/10 flex items-center justify-center text-[#01C1D6]">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-black text-black dark:text-white uppercase tracking-tighter">{t('vaultProtocol')}</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-bold text-neutral-900 dark:text-neutral-500 uppercase tracking-widest">{t('activeProtection')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                 {[
                   { label: t('features.dataEncryption'), status: t('features.aes256') },
                   { label: t('features.withdrawalLock'), status: t('features.enabled') },
                   { label: t('features.ipWhitelisting'), status: t('features.active') }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-black/40 border border-black/5 dark:border-white/5">
                      <span className="text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-400">{item.label}</span>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[#01C1D6]">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{item.status}</span>
                        <CheckCircle2 size={14} />
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-6 sm:mt-8 md:mt-10 p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl bg-black dark:bg-[#050505] text-white">
                 <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#01C1D6] mb-1 sm:mb-2">{t('securityScore')}</p>
                 <div className="flex items-end gap-2 sm:gap-3">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">99.8%</span>
                    <span className="text-[10px] sm:text-xs font-bold text-neutral-600 dark:text-neutral-500 mb-1 sm:mb-2 italic">{t('institutionalGrade')}</span>
                 </div>
              </div>
            </div>

            {/* Floating Element */}
            <motion.div 
               animate={{ y: [0, -20, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 md:-top-6 md:-right-6 p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-[#01C1D6] text-white shadow-2xl z-20 flex items-center gap-2 sm:gap-3"
            >
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest">{t('secureCore')}</span>
            </motion.div>
          </motion.div>

          {/* Right Side: Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col space-y-5 sm:space-y-6 md:space-y-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#01C1D6]/20 bg-[#01C1D6]/5 mb-4 sm:mb-5 md:mb-6">
                <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-[#01C1D6] uppercase">{t('safetyFirst')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-black dark:text-white tracking-tighter leading-tight mb-4 sm:mb-5 md:mb-6">
                {t('headline.prefix')} <br className="hidden sm:block"/>
                <span className="text-[#01C1D6]">{t('headline.suffix')}</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 font-medium max-w-lg leading-relaxed">
                {t('description')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
              {securityFeatures.map((f, i) => (
                <div key={i} className="space-y-2 sm:space-y-3">
                  <div className="mb-1 sm:mb-2">
                    {f.icon}
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-black dark:text-white uppercase tracking-tight">{f.title}</h4>
                  <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

