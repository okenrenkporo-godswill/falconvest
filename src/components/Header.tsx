"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Sun, Moon, Globe, ChevronDown, Menu, X, TrendingUp, BarChart3, Wallet, CreditCard, ChevronRight, CandlestickChart } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from 'next/navigation';
import { setUserLocale } from '@/services/locale'; 

const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "tr", name: "Türkçe", flag: "🇹🇷" },
];

export default function Header() {
  const t = useTranslations("Header");
  const router = useRouter();
  const currentLocale = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(languages.find(l => l.code === currentLocale) || languages[0]);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSelectedLang(languages.find(l => l.code === currentLocale) || languages[0]);
  }, [currentLocale]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const switchLocale = async (locale: string) => {
    await setUserLocale(locale as any);
    router.refresh();
    setIsLangOpen(false);
  };

  if (!mounted) return null;

  return (
    <>
    <nav className="border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-md fixed top-0 w-full z-[100] transition-colors duration-500">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center relative z-[110]">
        
        <div className="flex items-center gap-4 md:gap-8">
            <Link href="/" className="flex items-center gap-1.5 md:gap-2 group">
                <div className="relative w-6 h-6 md:w-8 md:h-8 transition-transform group-hover:scale-110 duration-300">
                    <Image src="/images/logo1.png" alt="FalconVest Logo" fill className="object-contain" />
                </div>
                <span className="text-lg md:text-2xl font-black text-black dark:text-white tracking-tighter uppercase italic">
                    FalconVest
                </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8 ml-4">
                
                {/* Offering Dropdown */}
                <div className="relative group/offering py-4">
                    <button className="flex items-center gap-1.5 text-sm font-bold text-neutral-600 dark:text-neutral-400 group-hover/offering:text-[#01C1D6] transition-colors">
                        {t('offering')} <ChevronDown size={14} className="transition-transform group-hover/offering:rotate-180" />
                    </button>
                    <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/offering:opacity-100 group-hover/offering:translate-y-0 group-hover/offering:pointer-events-auto transition-all duration-300">
                        <div className="w-[480px] bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 rounded-3xl shadow-2xl p-8 backdrop-blur-xl">
                            <div className="grid grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-400 mb-6">{t('tradingMarkets')}</h3>
                                    <div className="flex flex-col gap-4">
                                        <Link href="/markets/forex" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#01C1D6] transition-colors">{t('forexExchange')}</span>
                                            <span className="text-[10px] text-neutral-500 font-medium italic">{t('forexDesc')}</span>
                                        </Link>
                                        <Link href="/markets/stocks" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#01C1D6] transition-colors">{t('stockMarkets')}</span>
                                            <span className="text-[10px] text-neutral-500 font-medium italic">{t('stocksDesc')}</span>
                                        </Link>
                                        <Link href="/markets/crypto" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#01C1D6] transition-colors">{t('cryptoAssets')}</span>
                                            <span className="text-[10px] text-neutral-500 font-medium italic">{t('cryptoDesc')}</span>
                                        </Link>
                                    </div>
                                </div>
                              
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Dropdown */}
                <div className="relative group/social py-4">
                    <button className="flex items-center gap-1.5 text-sm font-bold text-neutral-600 dark:text-neutral-400 group-hover/social:text-[#01C1D6] transition-colors">
                        {t('social')} <ChevronDown size={14} className="transition-transform group-hover/social:rotate-180" />
                    </button>
                    <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/social:opacity-100 group-hover/social:translate-y-0 group-hover/social:pointer-events-auto transition-all duration-300">
                        <div className="w-[320px] bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 rounded-3xl shadow-2xl p-6 backdrop-blur-xl">
                            <div className="flex flex-col gap-4">
                                <Link href="/social" className="group/link flex flex-col gap-1">
                                    <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#01C1D6] transition-colors">{t('socialHub')}</span>
                                    <span className="text-[10px] text-neutral-500 font-medium">{t('socialHubDesc')}</span>
                                </Link>
                                <Link href="/" className="group/link flex flex-col gap-1">
                                    <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#01C1D6] transition-colors">{t('copyTrading')}</span>
                                    <span className="text-[10px] text-neutral-500 font-medium">{t('copyTradingDesc')}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Company Dropdown */}
                <div className="relative group/company py-4">
                    <button className="flex items-center gap-1.5 text-sm font-bold text-neutral-600 dark:text-neutral-400 group-hover/company:text-[#01C1D6] transition-colors">
                        {t('company')} <ChevronDown size={14} className="transition-transform group-hover/company:rotate-180" />
                    </button>
                    
                    <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/company:opacity-100 group-hover/company:translate-y-0 group-hover/company:pointer-events-auto transition-all duration-300">
                        <div className="w-[520px] bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 rounded-3xl shadow-2xl p-8 backdrop-blur-xl">
                            <div className="grid grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-400 mb-6">{t('aboutUs')}</h3>
                                    <div className="flex flex-col gap-4">
                                        <Link href="/why-FalconVest" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#01C1D6] transition-colors">{t('whyFalconVest')}</span>
                                            <span className="text-[10px] text-neutral-500 font-medium">{t('whyFalconVestDesc')}</span>
                                        </Link>
                                        <Link href="/reviews" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#01C1D6] transition-colors">{t('reviews')}</span>
                                            <span className="text-[10px] text-neutral-500 font-medium">{t('reviewsDesc')}</span>
                                        </Link>
                                        <Link href="/blog" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#01C1D6] transition-colors">{t('blog')}</span>
                                            <span className="text-[10px] text-neutral-500 font-medium">{t('blogDesc')}</span>
                                        </Link>
                                        <Link href="/careers" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#01C1D6] transition-colors">{t('careers')}</span>
                                            <span className="text-[10px] text-neutral-500 font-medium italic">{t('careersDesc')}</span>
                                        </Link>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-400 mb-6">{t('resources')}</h3>
                                    <div className="flex flex-col gap-4">
                                        <Link href="/investor-relations" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#01C1D6] transition-colors">{t('investorRelations')}</span>
                                            <span className="text-[10px] text-neutral-500 font-medium">{t('investorRelationsDesc')}</span>
                                        </Link>
                                        <Link href="/help-center" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#01C1D6] transition-colors">{t('helpCenter')}</span>
                                            <span className="text-[10px] text-neutral-500 font-medium">{t('helpCenterDesc')}</span>
                                        </Link>
                                        <Link href="/legal" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#01C1D6] transition-colors">{t('legalCompliance')}</span>
                                            <span className="text-[10px] text-neutral-500 font-medium">{t('legalComplianceDesc')}</span>
                                        </Link>
                                        <Link href="/contact" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#01C1D6] transition-colors">{t('contactUs')}</span>
                                            <span className="text-[10px] text-neutral-500 font-medium">{t('contactUsDesc')}</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Link href="/partnerships" className="text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-[#01C1D6] transition-colors">{t('partnerships')}</Link>
            </div>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
            
            {/* Language Selector (Mobile & Desktop) */}
            <div className="relative z-[70]">
                <button 
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm font-bold text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                >
                    <span className="text-base">{selectedLang.flag}</span>
                    <span className="uppercase tracking-widest">{selectedLang.code}</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isLangOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full right-0 mt-3 w-48 bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden py-2"
                        >
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        if (lang.code !== currentLocale) {
                                            switchLocale(lang.code);
                                        }
                                        setIsLangOpen(false);
                                    }}
                                    className={`w-full text-left px-5 py-3 text-sm flex items-center gap-3 group hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${selectedLang.code === lang.code ? 'text-[#01C1D6] bg-black/5 dark:bg-white/5 font-black' : 'text-neutral-500 dark:text-neutral-400 font-medium'}`}
                                >
                                    <span className="text-lg">{lang.flag}</span>
                                    <span className="flex-1">{lang.name}</span>
                                    {selectedLang.code === lang.code && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#01C1D6]" />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 hover:text-[#01C1D6] transition-all"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-black/5 dark:bg-white/5 text-black dark:text-white hover:bg-black/10 transition-colors"
                aria-label="Open Menu"
            >
                <Menu size={24} />
            </button>

            <div className="h-6 w-[1px] bg-black/5 dark:bg-white/10 hidden lg:block"></div>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex gap-3">
                <Button 
                    as={Link} 
                    href="/login" 
                    variant="light" 
                    className="text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-bold text-sm uppercase tracking-wider"
                >
                {t('login')}
                </Button>
                <Button 
                    as={Link} 
                    href="/register" 
                    className="bg-[#01C1D6] hover:bg-[#00ADC0] text-white font-black text-xs uppercase tracking-[0.15em] px-8 rounded-xl shadow-lg shadow-[#01C1D6]/20"
                >
                {t('signUp')}
                </Button>
            </div>
        </div>
      </div>

    </nav>

    {/* Mobile Menu Overlay - Moved outside nav for proper stacking */}
    <AnimatePresence>
        {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 bg-white dark:bg-black z-[999] lg:hidden overflow-y-auto"
            >
                {/* Overlay Header */}
                <div className="sticky top-0 bg-white dark:bg-black border-b border-black/5 dark:border-white/5 z-[1000] py-4">
                    <div className="w-full px-6 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                            <div className="relative w-7 h-7">
                                <Image src="/images/logo1.png" alt="FalconVest Logo" fill className="object-contain" />
                            </div>
                            <span className="text-xl font-black text-black dark:text-white uppercase italic tracking-tighter">FalconVest</span>
                        </Link>
                        
                        <div className="flex items-center gap-4">
                            <button 
                              onClick={() => setIsLangOpen(!isLangOpen)}
                              className="flex items-center gap-1.5 text-[10px] font-black text-neutral-500 uppercase tracking-widest"
                            >
                                <span className="text-lg">{selectedLang.flag}</span>
                                <span>{selectedLang.code}</span>
                                <ChevronDown size={14} className={isLangOpen ? 'rotate-180' : ''} />
                            </button>
                            
                            <button 
                              autoFocus
                              onClick={() => setIsMenuOpen(false)}
                              className="p-2 text-black dark:text-white hover:bg-black/5 rounded-full transition-colors"
                            >
                                <X size={32} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-full px-6 py-10 flex flex-col min-h-screen text-black dark:text-white">
                    
                    {/* Grid Blocks (NAGA Style - Matching hambuger.png) */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {[
                            { label: t('menu.trade'), icon: <CandlestickChart size={20} />, active: true, href: "/markets/forex" },
                            { label: t('menu.invest'), icon: <BarChart3 size={20} />, href: "/markets/stocks" },
                            { label: t('menu.crypto'), icon: <Wallet size={20} />, soon: true, href: "/markets/crypto" },
                            { label: t('menu.pay'), icon: <CreditCard size={20} />, soon: true, href: "/register" }
                        ].map((item, i) => (
                            <Link 
                              key={i} 
                              href={item.href}
                              onClick={() => setIsMenuOpen(false)}
                              className={`flex flex-col items-start p-3 border-2 transition-all rounded-2xl ${item.active ? 'bg-black dark:bg-[#050505] border-[#01C1D6] shadow-xl shadow-[#01C1D6]/10 scale-[1.01]' : 'bg-[#fafafa] dark:bg-[#0a0a0a] border-black/5 dark:border-white/5'}`}
                            >
                                <div className={`p-2 rounded-xl mb-2 ${item.active ? 'text-[#01C1D6] bg-[#01C1D6]/10' : 'text-neutral-500'}`}>
                                    {item.icon}
                                </div>
                                <div className="flex items-center justify-between w-full mt-1">
                                    <span className={`text-[13px] font-black uppercase tracking-tight ${item.active ? 'text-[#01C1D6]' : 'text-neutral-500 dark:text-neutral-400'}`}>{item.label}</span>
                                    {item.soon && <span className="text-[8px] font-black uppercase tracking-widest bg-[#01C1D6] text-white px-1.5 py-0.5 rounded-full">{t('menu.soon')}</span>}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Collapsible List */}
                    <div className="flex-1 space-y-2">
                        {[
                            { 
                              label: t('socialHub'), 
                              subItems: [
                                  { label: t('menu.communityFeed'), href: "/social" },
                                  { label: t('copyTrading'), href: "/" },
                              ]
                            },
                            { 
                              label: t('offering'), 
                              subItems: [
                                  { label: t('forexExchange'), href: "/markets/forex" },
                                  { label: t('stockMarkets'), href: "/markets/stocks" },
                                  { label: t('cryptoAssets'), href: "/markets/crypto" },
                              ]
                            },
                            { 
                              label: t('resources'), 
                              subItems: [
                                  { label: t('helpCenter'), href: "/help-center" },
                                  { label: t('menu.legalDocuments'), href: "/legal" },
                                  { label: t('contactUs'), href: "/contact" }
                              ]
                            },
                            { 
                              label: t('company'), 
                              subItems: [
                                  { label: t('whyFalconVest'), href: "/why-FalconVest" },
                                  { label: t('reviews'), href: "/reviews" },
                                  { label: t('blog'), href: "/blog" },
                                  { label: t('careers'), href: "/careers" },
                                  { label: t('investorRelations'), href: "/investor-relations" },
                                  { label: t('contactUs'), href: "/contact" },
                                  { label: t('helpCenter'), href: "/help-center" },
                                  { label: t('menu.legalDocuments'), href: "/legal" }
                              ]
                            },
                            { label: t('partnerships'), href: "/partnerships" }
                        ].map((item, i) => (
                            <div key={i} className="border-b border-black/5 dark:border-white/5 last:border-0">
                                {item.subItems ? (
                                    <>
                                        <button 
                                          onClick={() => setOpenSection(openSection === item.label ? null : item.label)}
                                          className="w-full flex items-center justify-between py-3"
                                        >
                                            <span className="font-black text-base text-black dark:text-white uppercase tracking-tight">{item.label}</span>
                                            <ChevronDown size={18} className={`text-neutral-400 transition-transform duration-500 ${openSection === item.label ? 'rotate-180' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {openSection === item.label && (
                                                <motion.div 
                                                  initial={{ height: 0, opacity: 0 }}
                                                  animate={{ height: 'auto', opacity: 1 }}
                                                  exit={{ height: 0, opacity: 0 }}
                                                  className="overflow-hidden flex flex-col gap-5 pb-8 pl-4"
                                                >
                                                    {item.subItems.map((sub, j) => (
                                                        <Link 
                                                          key={j} 
                                                          href={sub.href}
                                                          onClick={() => setIsMenuOpen(false)}
                                                          className="text-base font-bold text-neutral-500 dark:text-neutral-400 hover:text-[#01C1D6] transition-colors"
                                                        >
                                                            {sub.label}
                                                        </Link>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <Link 
                                      href={item.href || '#'}
                                      onClick={() => setIsMenuOpen(false)}
                                      className="flex items-center justify-between py-5"
                                    >
                                        <span className="font-black text-lg text-black dark:text-white uppercase tracking-tight">{item.label}</span>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Mobile Footer CTAs */}
                    <div className="mt-8 pb-10 grid grid-cols-2 gap-3">
                        <Button 
                          as={Link} 
                          href="/login"
                          variant="bordered"
                          className="border-neutral-200 dark:border-neutral-800 font-black h-12 rounded-xl text-[10px] uppercase bg-neutral-100 dark:bg-neutral-900 tracking-widest flex-1 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                          onClick={() => setIsMenuOpen(false)}
                        >
                            {t('login')}
                        </Button>
                        <Button 
                          as={Link} 
                          href="/register"
                          className="bg-[#01C1D6] text-white font-black h-12 rounded-xl shadow-lg shadow-[#01C1D6]/20 text-[10px] uppercase tracking-widest flex-1 hover:bg-[#00ADC0]"
                          onClick={() => setIsMenuOpen(false)}
                        >
                            {t('signUp')}
                        </Button>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
    </>
  );
}
