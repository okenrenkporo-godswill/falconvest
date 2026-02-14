"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Sun, Moon, Globe, ChevronDown, Menu, X, TrendingUp, BarChart3, Wallet, CreditCard, ChevronRight, CandlestickChart } from "lucide-react";

const languages = [
    { code: "ENG", name: "English" },
    { code: "ESP", name: "Español" },
    { code: "FRA", name: "Français" },
    { code: "DEU", name: "Deutsch" },
    { code: "JPN", name: "日本語" },
    { code: "CHN", name: "中文" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
    <nav className="border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-md fixed top-0 w-full z-[100] transition-colors duration-500">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center relative z-[110]">
        
        <div className="flex items-center gap-4 md:gap-8">
            <Link href="/" className="flex items-center gap-1.5 md:gap-2 group">
                <div className="relative w-6 h-6 md:w-8 md:h-8 transition-transform group-hover:scale-110 duration-300">
                    <Image src="/images/logo.png" alt="MasterSync Logo" fill className="object-contain" />
                </div>
                <span className="text-lg md:text-2xl font-black text-black dark:text-white tracking-tighter uppercase italic">
                    MasterSync
                </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8 ml-4">
                
                {/* Offering Dropdown */}
                <div className="relative group/offering py-4">
                    <button className="flex items-center gap-1.5 text-sm font-bold text-neutral-600 dark:text-neutral-400 group-hover/offering:text-[#FF6347] transition-colors">
                        Offering <ChevronDown size={14} className="transition-transform group-hover/offering:rotate-180" />
                    </button>
                    <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/offering:opacity-100 group-hover/offering:translate-y-0 group-hover/offering:pointer-events-auto transition-all duration-300">
                        <div className="w-[480px] bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 rounded-3xl shadow-2xl p-8 backdrop-blur-xl">
                            <div className="grid grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-400 mb-6">Trading Markets</h3>
                                    <div className="flex flex-col gap-4">
                                        <Link href="/markets/forex" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#FF6347] transition-colors">Forex Exchange</span>
                                            <span className="text-[10px] text-neutral-500 font-medium italic">Institutional spreads from 0.0 pips</span>
                                        </Link>
                                        <Link href="/markets/stocks" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#FF6347] transition-colors">Stock Markets</span>
                                            <span className="text-[10px] text-neutral-500 font-medium italic">Global indices and elite equities</span>
                                        </Link>
                                        <Link href="/markets/crypto" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#FF6347] transition-colors">Crypto Assets</span>
                                            <span className="text-[10px] text-neutral-500 font-medium italic">24/7 direct blockchain access</span>
                                        </Link>
                                    </div>
                                </div>
                              
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Dropdown */}
                <div className="relative group/social py-4">
                    <button className="flex items-center gap-1.5 text-sm font-bold text-neutral-600 dark:text-neutral-400 group-hover/social:text-[#FF6347] transition-colors">
                        Social <ChevronDown size={14} className="transition-transform group-hover/social:rotate-180" />
                    </button>
                    <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/social:opacity-100 group-hover/social:translate-y-0 group-hover/social:pointer-events-auto transition-all duration-300">
                        <div className="w-[320px] bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 rounded-3xl shadow-2xl p-6 backdrop-blur-xl">
                            <div className="flex flex-col gap-4">
                                <Link href="/social" className="group/link flex flex-col gap-1">
                                    <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#FF6347] transition-colors">Social Hub</span>
                                    <span className="text-[10px] text-neutral-500 font-medium">Connect with top institutional traders</span>
                                </Link>
                                <Link href="/" className="group/link flex flex-col gap-1">
                                    <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#FF6347] transition-colors">Copy Trading</span>
                                    <span className="text-[10px] text-neutral-500 font-medium">Automate your success with MasterSync</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Company Dropdown */}
                <div className="relative group/company py-4">
                    <button className="flex items-center gap-1.5 text-sm font-bold text-neutral-600 dark:text-neutral-400 group-hover/company:text-[#FF6347] transition-colors">
                        Company <ChevronDown size={14} className="transition-transform group-hover/company:rotate-180" />
                    </button>
                    
                    <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/company:opacity-100 group-hover/company:translate-y-0 group-hover/company:pointer-events-auto transition-all duration-300">
                        <div className="w-[520px] bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 rounded-3xl shadow-2xl p-8 backdrop-blur-xl">
                            <div className="grid grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-400 mb-6">About Us</h3>
                                    <div className="flex flex-col gap-4">
                                        <Link href="/why-mastersync" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#FF6347] transition-colors">Why MasterSync</span>
                                            <span className="text-[10px] text-neutral-500 font-medium">Our mission and institutional roots</span>
                                        </Link>
                                        <Link href="/reviews" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#FF6347] transition-colors">Reviews</span>
                                            <span className="text-[10px] text-neutral-500 font-medium">What our global traders say</span>
                                        </Link>
                                        <Link href="/blog" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#FF6347] transition-colors">MasterSync Blog</span>
                                            <span className="text-[10px] text-neutral-500 font-medium">Latest market insights and news</span>
                                        </Link>
                                        <Link href="/careers" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#FF6347] transition-colors">Careers</span>
                                            <span className="text-[10px] text-neutral-500 font-medium italic">Join our global network</span>
                                        </Link>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-400 mb-6">Resources</h3>
                                    <div className="flex flex-col gap-4">
                                        <Link href="/investor-relations" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#FF6347] transition-colors">Investor Relations</span>
                                            <span className="text-[10px] text-neutral-500 font-medium">Corporate data and governance</span>
                                        </Link>
                                        <Link href="/help-center" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#FF6347] transition-colors">Help Center</span>
                                            <span className="text-[10px] text-neutral-500 font-medium">Knowledge base and tutorials</span>
                                        </Link>
                                        <Link href="/legal" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#FF6347] transition-colors">Legal & Compliance</span>
                                            <span className="text-[10px] text-neutral-500 font-medium">Protecting your institutional rights</span>
                                        </Link>
                                        <Link href="/contact" className="group/link flex flex-col gap-1">
                                            <span className="text-sm font-bold text-black dark:text-white group-hover/link:text-[#FF6347] transition-colors">Contact Us</span>
                                            <span className="text-[10px] text-neutral-500 font-medium">24/7 Global Priority access</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Link href="/partnerships" className="text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-[#FF6347] transition-colors">Partnerships</Link>
            </div>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
            
            {/* Language Selector (Mobile & Desktop) */}
            <div className="relative z-[70]">
                <button 
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm font-bold text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                >
                    <Globe size={16} className="md:w-[18px]" />
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
                                        setSelectedLang(lang);
                                        setIsLangOpen(false);
                                    }}
                                    className={`w-full text-left px-5 py-3 text-sm flex items-center justify-between group hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${selectedLang.code === lang.code ? 'text-[#FF6347] bg-black/5 dark:bg-white/5 font-black' : 'text-neutral-500 dark:text-neutral-400 font-medium'}`}
                                >
                                    <span>{lang.name}</span>
                                    {selectedLang.code === lang.code && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF6347]" />
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
              className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 hover:text-[#FF6347] transition-all"
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
                Login
                </Button>
                <Button 
                    as={Link} 
                    href="/register" 
                    className="bg-[#FF6347] hover:bg-[#e05035] text-white font-black text-xs uppercase tracking-[0.15em] px-8 rounded-xl shadow-lg shadow-[#FF6347]/20"
                >
                Sign Up
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
                                <Image src="/images/logo.png" alt="MasterSync Logo" fill className="object-contain" />
                            </div>
                            <span className="text-xl font-black text-black dark:text-white uppercase italic tracking-tighter">MasterSync</span>
                        </Link>
                        
                        <div className="flex items-center gap-4">
                            <button 
                              onClick={() => setIsLangOpen(!isLangOpen)}
                              className="flex items-center gap-1.5 text-[10px] font-black text-neutral-500 uppercase tracking-widest"
                            >
                                <Globe size={18} />
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
                    <div className="grid grid-cols-2 gap-4 mb-12">
                        {[
                            { label: "Trade", icon: <CandlestickChart size={14} />, active: true, href: "/markets/forex" },
                            { label: "Invest", icon: <BarChart3 size={24} />, href: "/markets/stocks" },
                            { label: "Crypto", icon: <Wallet size={24} />, soon: true, href: "/markets/crypto" },
                            { label: "Pay", icon: <CreditCard size={24} />, soon: true, href: "/register" }
                        ].map((item, i) => (
                            <Link 
                              key={i} 
                              href={item.href}
                              onClick={() => setIsMenuOpen(false)}
                              className={`flex flex-col items-start  p-1  border-2 transition-all ${item.active ? 'bg-black dark:bg-[#050505] border-[#FF6347] shadow-2xl shadow-[#FF6347]/20 scale-[1.02]' : 'bg-[#fafafa] dark:bg-[#0a0a0a] border-black/5 dark:border-white/5 opacity-80'}`}
                            >
                                <div className={`p-2 rounded-xl ${item.active ? 'text-[#FF6347] bg-[#FF6347]/10' : 'text-neutral-500'}`}>
                                    {item.icon}
                                </div>
                                <div className="flex items-center justify-between w-full">
                                    <span className={`text-[15px] font-black uppercase tracking-tight ${item.active ? 'text-[#FF6347]' : 'text-neutral-500 dark:text-neutral-400'}`}>{item.label}</span>
                                    {item.soon && <span className="text-[9px] font-black uppercase tracking-widest bg-[#FF6347] text-white px-2 py-0.5 rounded-full">Soon</span>}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Collapsible List */}
                    <div className="flex-1 space-y-2">
                        {[
                            { 
                              label: "Social Hub", 
                              subItems: [
                                  { label: "Community Feed", href: "/social" },
                                  { label: "Copy Trading", href: "/" },
                              ]
                            },
                            { 
                              label: "Offering", 
                              subItems: [
                                  { label: "Forex", href: "/markets/forex" },
                                  { label: "Stocks", href: "/markets/stocks" },
                                  { label: "Crypto", href: "/markets/crypto" },
                              ]
                            },
                            { 
                              label: "Resources", 
                              subItems: [
                                  { label: "Help Center", href: "/help-center" },
                                  { label: "Legal Documents", href: "/legal" },
                                  { label: "Contact Us", href: "/contact" }
                              ]
                            },
                            { 
                              label: "Company", 
                              subItems: [
                                  { label: "Why MasterSync", href: "/why-mastersync" },
                                  { label: "Reviews", href: "/reviews" },
                                  { label: "MasterSync Blog", href: "/blog" },
                                  { label: "Careers", href: "/careers" },
                                  { label: "Investor Relations", href: "/investor-relations" },
                                  { label: "Contact Us", href: "/contact" },
                                  { label: "Help Center", href: "/help-center" },
                                  { label: "Legal Documents", href: "/legal" }
                              ]
                            },
                            { label: "Partnerships", href: "/partnerships" }
                        ].map((item, i) => (
                            <div key={i} className="border-b border-black/5 dark:border-white/5 last:border-0">
                                {item.subItems ? (
                                    <>
                                        <button 
                                          onClick={() => setOpenSection(openSection === item.label ? null : item.label)}
                                          className="w-full flex items-center justify-between py-5"
                                        >
                                            <span className="font-black text-lg text-black dark:text-white uppercase tracking-tight">{item.label}</span>
                                            <ChevronDown size={22} className={`text-neutral-400 transition-transform duration-500 ${openSection === item.label ? 'rotate-180' : ''}`} />
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
                                                          className="text-base font-bold text-neutral-500 dark:text-neutral-400 hover:text-[#FF6347] transition-colors"
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
                    <div className="mt-16 pb-20 grid grid-cols-2 gap-5">
                        <Button 
                          as={Link} 
                          href="/login"
                          variant="bordered"
                          className="border-neutral-200 dark:border-neutral-800 font-black h-16 rounded-[1.5rem] text-xs uppercase bg-neutral-100 dark:bg-neutral-900 tracking-widest flex-1"
                          onClick={() => setIsMenuOpen(false)}
                        >
                            Login
                        </Button>
                        <Button 
                          as={Link} 
                          href="/register"
                          className="bg-[#FF6347] text-white font-black h-16 rounded-[1.5rem] shadow-2xl shadow-[#FF6347]/30 text-xs uppercase tracking-widest flex-1"
                          onClick={() => setIsMenuOpen(false)}
                        >
                            Get started
                        </Button>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
    </>
  );
}
