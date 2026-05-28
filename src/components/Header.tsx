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
import GoogleTranslate from "@/components/GoogleTranslate";

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

  const [isScrolled, setIsScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Scrolled past 20px threshold
      setIsScrolled(currentScrollY > 20);

      // Hide header when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    // Sync UI with googtrans cookie if present
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return undefined;
    };
    const googtrans = getCookie('googtrans');
    if (googtrans) {
      const parts = googtrans.split('/');
      const cookieLang = parts[parts.length - 1];
      if (cookieLang) {
        const found = languages.find(l => l.code === cookieLang);
        if (found) {
          setSelectedLang(found);
        }
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const switchLocale = async (locale: string) => {
    if (locale === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    } else {
      document.cookie = `googtrans=/en/${locale}; path=/;`;
      document.cookie = `googtrans=/en/${locale}; path=/; domain=${window.location.hostname};`;
    }

    // Trigger Google Translate engine instantly
    const googleSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (googleSelect) {
      googleSelect.value = locale;
      googleSelect.dispatchEvent(new Event('change'));
    } else {
      // Fallback to reload if widget hasn't mounted
      window.location.reload();
    }

    await setUserLocale(locale as any);
    setSelectedLang(languages.find(l => l.code === locale) || languages[0]);
    setIsLangOpen(false);
  };

  if (!mounted) return null;

  return (
    <>
    <nav className={`border-b border-black/5 dark:border-white/10 bg-white/95 dark:bg-neutral-950/95 shadow-md shadow-black/5 dark:shadow-white/5 backdrop-blur-md fixed top-0 w-full z-[100] transition-all duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'} ${isScrolled ? 'py-1 shadow-lg' : 'py-2.5'}`}>
      <div className="container mx-auto px-4 py-2 flex justify-between items-center relative z-[110]">
        
        <div className="flex items-center gap-3 md:gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
                {/* Modern Dynamic Logo */}
                <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                    {/* Glowing background bubble */}
                    <div className="absolute inset-0 bg-[#7eb2bd]/20 dark:bg-[#33525c]/20 blur-md rounded-full scale-110 group-hover:bg-[#7eb2bd]/30 group-hover:scale-125 transition-all duration-300" />
                    
                    {/* Futuristic Emblem */}
                    <svg viewBox="0 0 100 100" className="w-7 h-7 relative z-10 drop-shadow-[0_2px_8px_rgba(51,82,92,0.3)] transition-transform duration-500 group-hover:rotate-[15deg]">
                        <path 
                            d="M 50 10 L 85 45 L 70 50 L 50 25 L 30 50 L 15 45 Z" 
                            fill="url(#header-logo-grad-1)" 
                        />
                        <path 
                            d="M 50 30 L 90 70 L 65 75 L 50 55 L 35 75 L 10 70 Z" 
                            fill="url(#header-logo-grad-2)" 
                        />
                        <defs>
                            <linearGradient id="header-logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#7eb2bd" />
                                <stop offset="100%" stopColor="#33525c" />
                            </linearGradient>
                            <linearGradient id="header-logo-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#a9ccd3" />
                                <stop offset="100%" stopColor="#5399a7" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <span className="text-[12px] font-extrabold text-black dark:text-white tracking-widest uppercase">
                    Falcon<span className="text-[#33525c] dark:text-[#7eb2bd]">Vest</span>
                </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-5 ml-2">
                
                {/* Offering Dropdown */}
                <div className="relative group/offering py-2">
                    <button className="flex items-center gap-1 text-xs font-bold text-neutral-600 dark:text-neutral-400 group-hover/offering:text-[#33525c] transition-colors">
                        {t('offering')} <ChevronDown size={12} className="transition-transform group-hover/offering:rotate-180" />
                    </button>
                    <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/offering:opacity-100 group-hover/offering:translate-y-0 group-hover/offering:pointer-events-auto transition-all duration-300">
                        <div className="w-[400px] bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl p-5 backdrop-blur-xl">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-400 mb-4">{t('tradingMarkets')}</h3>
                                    <div className="flex flex-col gap-3">
                                        <Link href="/markets/forex" className="group/link flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-black dark:text-white group-hover/link:text-[#33525c] transition-colors">{t('forexExchange')}</span>
                                            <span className="text-[9px] text-neutral-500 font-medium italic">{t('forexDesc')}</span>
                                        </Link>
                                        <Link href="/markets/stocks" className="group/link flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-black dark:text-white group-hover/link:text-[#33525c] transition-colors">{t('stockMarkets')}</span>
                                            <span className="text-[9px] text-neutral-500 font-medium italic">{t('stocksDesc')}</span>
                                        </Link>
                                        <Link href="/markets/crypto" className="group/link flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-black dark:text-white group-hover/link:text-[#33525c] transition-colors">{t('cryptoAssets')}</span>
                                            <span className="text-[9px] text-neutral-500 font-medium italic">{t('cryptoDesc')}</span>
                                        </Link>
                                    </div>
                                </div>
                              
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Dropdown */}
                <div className="relative group/social py-2">
                    <button className="flex items-center gap-1 text-xs font-bold text-neutral-600 dark:text-neutral-400 group-hover/social:text-[#33525c] transition-colors">
                        {t('social')} <ChevronDown size={12} className="transition-transform group-hover/social:rotate-180" />
                    </button>
                    <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/social:opacity-100 group-hover/social:translate-y-0 group-hover/social:pointer-events-auto transition-all duration-300">
                        <div className="w-[260px] bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl p-4 backdrop-blur-xl">
                            <div className="flex flex-col gap-3">
                                <Link href="/social" className="group/link flex flex-col gap-0.5">
                                    <span className="text-xs font-bold text-black dark:text-white group-hover/link:text-[#33525c] transition-colors">{t('socialHub')}</span>
                                    <span className="text-[9px] text-neutral-500 font-medium">{t('socialHubDesc')}</span>
                                </Link>
                                <Link href="/" className="group/link flex flex-col gap-0.5">
                                    <span className="text-xs font-bold text-black dark:text-white group-hover/link:text-[#33525c] transition-colors">{t('copyTrading')}</span>
                                    <span className="text-[9px] text-neutral-500 font-medium">{t('copyTradingDesc')}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Company Dropdown */}
                <div className="relative group/company py-2">
                    <button className="flex items-center gap-1 text-xs font-bold text-neutral-600 dark:text-neutral-400 group-hover/company:text-[#33525c] transition-colors">
                        {t('company')} <ChevronDown size={12} className="transition-transform group-hover/company:rotate-180" />
                    </button>
                    
                    <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/company:opacity-100 group-hover/company:translate-y-0 group-hover/company:pointer-events-auto transition-all duration-300">
                        <div className="w-[420px] bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl p-5 backdrop-blur-xl">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-400 mb-4">{t('aboutUs')}</h3>
                                    <div className="flex flex-col gap-3">
                                        <Link href="/why-Falcon" className="group/link flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-black dark:text-white group-hover/link:text-[#33525c] transition-colors">{t('whyFalcon')}</span>
                                            <span className="text-[9px] text-neutral-500 font-medium">{t('whyFalconDesc')}</span>
                                        </Link>
                                        <Link href="/reviews" className="group/link flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-black dark:text-white group-hover/link:text-[#33525c] transition-colors">{t('reviews')}</span>
                                            <span className="text-[9px] text-neutral-500 font-medium">{t('reviewsDesc')}</span>
                                        </Link>
                                        <Link href="/blog" className="group/link flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-black dark:text-white group-hover/link:text-[#33525c] transition-colors">{t('blog')}</span>
                                            <span className="text-[9px] text-neutral-500 font-medium">{t('blogDesc')}</span>
                                        </Link>
                                        <Link href="/careers" className="group/link flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-black dark:text-white group-hover/link:text-[#33525c] transition-colors">{t('careers')}</span>
                                            <span className="text-[9px] text-neutral-500 font-medium italic">{t('careersDesc')}</span>
                                        </Link>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-400 mb-4">{t('resources')}</h3>
                                    <div className="flex flex-col gap-3">
                                        <Link href="/investor-relations" className="group/link flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-black dark:text-white group-hover/link:text-[#33525c] transition-colors">{t('investorRelations')}</span>
                                            <span className="text-[9px] text-neutral-500 font-medium">{t('investorRelationsDesc')}</span>
                                        </Link>
                                        <Link href="/help-center" className="group/link flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-black dark:text-white group-hover/link:text-[#33525c] transition-colors">{t('helpCenter')}</span>
                                            <span className="text-[9px] text-neutral-500 font-medium">{t('helpCenterDesc')}</span>
                                        </Link>
                                        <Link href="/legal" className="group/link flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-black dark:text-white group-hover/link:text-[#33525c] transition-colors">{t('legalCompliance')}</span>
                                            <span className="text-[9px] text-neutral-500 font-medium">{t('legalComplianceDesc')}</span>
                                        </Link>
                                        <Link href="/contact" className="group/link flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-black dark:text-white group-hover/link:text-[#33525c] transition-colors">{t('contactUs')}</span>
                                            <span className="text-[9px] text-neutral-500 font-medium">{t('contactUsDesc')}</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Link href="/partnerships" className="text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-[#33525c] transition-colors">{t('partnerships')}</Link>
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
                                    className={`w-full text-left px-5 py-3 text-sm flex items-center gap-3 group hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${selectedLang.code === lang.code ? 'text-[#33525c] bg-black/5 dark:bg-white/5 font-black' : 'text-neutral-500 dark:text-neutral-400 font-medium'}`}
                                >
                                    <span className="text-lg">{lang.flag}</span>
                                    <span className="flex-1">{lang.name}</span>
                                    {selectedLang.code === lang.code && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#33525c]" />
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
              className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 hover:text-[#33525c] transition-all"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-black dark:text-white hover:bg-black/10 transition-colors"
                aria-label="Open Menu"
            >
                <Menu size={18} />
            </button>

            <div className="h-6 w-[1px] bg-black/5 dark:bg-white/10 hidden lg:block"></div>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex gap-2">
                <Button 
                    as={Link} 
                    href="/login" 
                    variant="light" 
                    className="text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-bold text-xs uppercase tracking-wider h-8 px-4"
                >
                {t('login')}
                </Button>
                <Button 
                    as={Link} 
                    href="/register" 
                    className="bg-[#33525c] hover:bg-[#2a4550] text-white font-black text-xs uppercase tracking-[0.15em] px-5 rounded-lg shadow-md shadow-[#33525c]/20 h-8"
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
                        <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setIsMenuOpen(false)}>
                            {/* Modern Dynamic Logo (Mobile) */}
                            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                                <div className="absolute inset-0 bg-[#7eb2bd]/20 dark:bg-[#33525c]/20 blur-md rounded-full scale-110" />
                                <svg viewBox="0 0 100 100" className="w-7 h-7 relative z-10 drop-shadow-[0_2px_8px_rgba(51,82,92,0.3)]">
                                    <path 
                                        d="M 50 10 L 85 45 L 70 50 L 50 25 L 30 50 L 15 45 Z" 
                                        fill="url(#mobile-logo-grad-1)" 
                                    />
                                    <path 
                                        d="M 50 30 L 90 70 L 65 75 L 50 55 L 35 75 L 10 70 Z" 
                                        fill="url(#mobile-logo-grad-2)" 
                                    />
                                    <defs>
                                        <linearGradient id="mobile-logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#7eb2bd" />
                                            <stop offset="100%" stopColor="#33525c" />
                                        </linearGradient>
                                        <linearGradient id="mobile-logo-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#a9ccd3" />
                                            <stop offset="100%" stopColor="#5399a7" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <span className="text-[13px] font-extrabold text-black dark:text-white tracking-widest uppercase">
                                Falcon<span className="text-[#33525c] dark:text-[#7eb2bd]">Vest</span>
                            </span>
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
                              className={`flex flex-col items-start p-3 border-2 transition-all rounded-2xl ${item.active ? 'bg-black dark:bg-[#050505] border-[#33525c] shadow-xl shadow-[#33525c]/10 scale-[1.01]' : 'bg-[#fafafa] dark:bg-[#0a0a0a] border-black/5 dark:border-white/5'}`}
                            >
                                <div className={`p-2 rounded-xl mb-2 ${item.active ? 'text-[#33525c] bg-[#33525c]/10' : 'text-neutral-500'}`}>
                                    {item.icon}
                                </div>
                                <div className="flex items-center justify-between w-full mt-1">
                                    <span className={`text-[13px] font-black uppercase tracking-tight ${item.active ? 'text-[#33525c]' : 'text-neutral-500 dark:text-neutral-400'}`}>{item.label}</span>
                                    {item.soon && <span className="text-[8px] font-black uppercase tracking-widest bg-[#33525c] text-white px-1.5 py-0.5 rounded-full">{t('menu.soon')}</span>}
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
                                  { label: t('whyFalcon'), href: "/why-Falcon" },
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
                                                          className="text-base font-bold text-neutral-500 dark:text-neutral-400 hover:text-[#33525c] transition-colors"
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
                          className="bg-[#33525c] text-white font-black h-12 rounded-xl shadow-lg shadow-[#33525c]/20 text-[10px] uppercase tracking-widest flex-1 hover:bg-[#2a4550]"
                          onClick={() => setIsMenuOpen(false)}
                        >
                            {t('signUp')}
                        </Button>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
    
    {/* Hidden Google Translate Engine */}
    <div className="hidden pointer-events-none opacity-0 invisible absolute">
      <GoogleTranslate />
    </div>
    </>
  );
}
