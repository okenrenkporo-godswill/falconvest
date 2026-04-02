"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@heroui/react";
import { 
  X, 
  ChevronRight, 
  ExternalLink, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  Globe, 
  CreditCard,
  Twitter,
  Instagram,
  Facebook,
  Linkedin
} from "lucide-react";
import { useTranslations } from "next-intl";

// --- Types & Data ---

type PanelType = "help" | "faq" | "legal" | "about" | "support" | "contact" | null;

// --- Components ---

const QuickViewPanel = ({ type, onClose }: { type: PanelType; onClose: () => void }) => {
    const t = useTranslations("Footer");
    if (!type) return null;

    const getContent = (type: PanelType) => {
        if (!type) return null;
        return {
            title: t(`panels.${type}.title`),
            description: t(`panels.${type}.description`),
            items: [
                { title: t(`panels.${type}.items.0.title`), desc: t(`panels.${type}.items.0.desc`) },
                { title: t(`panels.${type}.items.1.title`), desc: t(`panels.${type}.items.1.desc`) },
                { title: t(`panels.${type}.items.2.title`), desc: t(`panels.${type}.items.2.desc`) },
                // Some panels have 4 items, let's check
                ...(type === 'help' ? [{ title: t(`panels.${type}.items.3.title`), desc: t(`panels.${type}.items.3.desc`) }] : [])
            ]
        };
    };

    const content = getContent(type);
    if (!content) return null;

    return (
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full sm:w-[450px] h-full bg-white dark:bg-[#0a0a0a] z-[100] shadow-[-20px_0_50px_rgba(0,0,0,0.1)] dark:shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-black/5 dark:border-white/5 p-8 overflow-y-auto"
        >
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#01C1D6]/10 flex items-center justify-center text-[#01C1D6]">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">{content.title}</h2>
                        <p className="text-xs text-neutral-600 dark:text-neutral-500">{content.description}</p>
                    </div>
                </div>
                <button 
                   onClick={onClose}
                   className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="space-y-4">
                {content.items.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#01C1D6]/30 transition-all cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-black dark:text-white group-hover:text-[#01C1D6] transition-colors">{item.title}</h3>
                            <ChevronRight size={16} className="text-neutral-400 dark:text-neutral-600 transition-transform group-hover:translate-x-1" />
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-500 leading-relaxed">{item.desc}</p>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-[#01C1D6]/10 to-transparent border border-[#01C1D6]/10 text-center">
                <p className="text-sm text-neutral-400 mb-4">{t('panelCommon.needMoreInfo')}</p>
                <Button as={Link} href="/help-center" className="bg-[#01C1D6] text-white font-bold w-full rounded-xl">
                    {t('panelCommon.fullHelpCenter')}
                </Button>
            </div>
        </motion.div>
    );
};

export default function Footer() {
  const t = useTranslations("Footer");
  const [activePanel, setActivePanel] = useState<PanelType>(null);

  const FOOTER_LINKS = [
    {
      title: t('linkGroups.markets'),
      links: ["Forex", "CryptoX", "Shares", "Real Stocks", "Crypto", "Indices", "Commodities", "Futures", "ETFs"]
    },
    {
      title: t('linkGroups.platforms'),
      links: ["SyncTrade Web", "Sync iOS", "Sync Android", "MT5 Terminal", "Telegram Mini App"]
    },
    {
      title: t('linkGroups.pricing'),
      links: ["Hours & Fees", "Trading Holidays", "Deposit Methods", "Execution Policy", "Spreads"]
    },
    {
      title: t('linkGroups.company'),
      links: [
          { name: "Why SyncTrade", action: "about" },
          "Sponsorship", 
          { name: "Contact Us", action: "contact" }, 
          "Investors Relations", 
          "Reviews", 
          "Careers"
      ]
    },
    {
      title: t('linkGroups.documentation'),
      links: [
          { name: "Legal Documents", action: "legal" },
          { name: "Privacy Policy", action: "legal" },
          { name: "Cookie Policy", action: "legal" },
          "Manage Cookies"
      ]
    }
  ];

  const FOOTER_LINKS_2 = [
    {
      title: t('linkGroups.partnerships'),
      links: ["Institutional", "Affiliates", "IB Program"]
    },
    {
      title: t('linkGroups.help'),
      links: [
          { name: "Help Center", action: "help" },
          { name: "FAQ", action: "faq" },
          { name: "Contact us", action: "contact" }, 
          { name: "Customer Support", action: "support" }
      ]
    },
    {
      title: t('linkGroups.social'),
      links: ["Social Trading", "Copy Trading", "Leaderboard", "Become a Top Trader"]
    },
    {
      title: t('linkGroups.education'),
      links: ["Master Academy", "Encyclopedia", "Currency Converter", "Webinars"]
    },
    {
      title: t('linkGroups.news'),
      links: ["Market Updates", "Earnings Calendar", "Economic Calendar", "Sync Insights"]
    }
  ];

  const renderLinkGroup = (group: any) => (
    <div key={group.title} className="flex flex-col gap-4">
      <h3 className="text-black dark:text-white font-black text-sm uppercase tracking-widest">{group.title}</h3>
      <div className="flex flex-col gap-2.5">
        {group.links.map((link: any, i: number) => {
            const isObj = typeof link === 'object';
            const labelKey = isObj ? link.name : link;
            const label = t(`linkLabels.${labelKey}`);
            const action = isObj ? link.action : null;
            
            // Map known labels to specific routes, default others to /register
            let href = "/register";
            if (labelKey === "Why SyncTrade") href = "/why-synctrade";
            if (labelKey === "Reviews") href = "/reviews";
            if (labelKey === "Careers") href = "/careers";
            if (labelKey === "Investors Relations") href = "/investor-relations";
            
            // Markets
            if (labelKey === "Forex") href = "/markets/forex";
            if (labelKey === "Crypto") href = "/markets/crypto";
            if (labelKey === "Real Stocks" || labelKey === "Shares") href = "/markets/stocks";

            if (action) {
                return (
                    <button 
                      key={i} 
                      onClick={() => setActivePanel(action as PanelType)}
                      className="text-neutral-600 dark:text-neutral-500 text-xs font-medium hover:text-[#01C1D6] transition-colors text-left w-fit flex items-center gap-1 group"
                    >
                      {label}
                      {label.includes("→") || isObj ? null : (
                         <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink size={10} />
                         </span>
                      )}
                      {label.includes("→") && <ChevronRight size={12} />}
                    </button>
                );
            }

            return (
                <Link 
                  key={i} 
                  href={href}
                  className="text-neutral-600 dark:text-neutral-500 text-xs font-medium hover:text-[#01C1D6] transition-colors text-left w-fit flex items-center gap-1 group"
                >
                  {label}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={10} />
                  </span>
                </Link>
            );
        })}
      </div>
    </div>
  );

  return (
    <footer className="bg-neutral-100 dark:bg-black pt-24 pb-12 px-6 border-t border-black/5 dark:border-white/5 transition-colors duration-500">
      <div className="container mx-auto">
        
        {/* Brand & Social Section */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 mb-20">
            <div className="space-y-6 max-w-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 relative">
                        <Image src="/images/logo1.png" alt="SyncTrade" fill className="object-contain" />
                    </div>
                    <span className="text-2xl font-black text-black dark:text-white tracking-tighter uppercase italic">
                        SyncTrade
                    </span>
                </div>
                <p className="text-neutral-500 text-sm leading-relaxed">
                    {t('brandDescription')}
                </p>
                <div className="flex items-center gap-4">
                    {[Twitter, Instagram, Facebook, Linkedin].map((Icon, i) => (
                        <button key={i} className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-neutral-600 dark:text-neutral-500 hover:text-white hover:bg-[#01C1D6] transition-all">
                            <Icon size={18} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-8 lg:gap-12 p-8 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-black dark:text-white">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-black dark:text-white text-sm font-bold">{t('badges.secured.title')}</p>
                        <p className="text-neutral-600 dark:text-neutral-500 text-xs">{t('badges.secured.desc')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-black dark:text-white">
                        <Globe size={20} />
                    </div>
                    <div>
                        <p className="text-black dark:text-white text-sm font-bold">{t('badges.global.title')}</p>
                        <p className="text-neutral-600 dark:text-neutral-500 text-xs">{t('badges.global.desc')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-black dark:text-white">
                        <CreditCard size={20} />
                    </div>
                    <div>
                        <p className="text-black dark:text-white text-sm font-bold">{t('badges.funding.title')}</p>
                        <p className="text-neutral-600 dark:text-neutral-500 text-xs">{t('badges.funding.desc')}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Links Grid - Multi Row */}
        <div className="space-y-12 mb-20">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                {FOOTER_LINKS.map(renderLinkGroup)}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 pt-12 border-t border-white/5">
                {FOOTER_LINKS_2.map(renderLinkGroup)}
            </div>
        </div>

        {/* Regulatory & Bottom Section */}
        <div className="pt-12 border-t border-white/5 space-y-8">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                <div className="max-w-4xl">
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-600 font-medium leading-relaxed uppercase tracking-wider">
                        {t('riskWarning')}
                    </p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                    <Link href="#" className="text-[10px] text-neutral-600 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors font-black uppercase tracking-widest">{t('links.compliance')}</Link>
                    <Link href="#" className="text-[10px] text-neutral-600 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors font-black uppercase tracking-widest">{t('links.ethics')}</Link>
                    <Link href="#" className="text-[10px] text-neutral-600 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors font-black uppercase tracking-widest">{t('links.security')}</Link>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-neutral-600 dark:text-neutral-500">
                    {t('copyright')}
                </p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-neutral-500 font-mono">{t('systemStatus')}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Dynamic Overlays */}
      <AnimatePresence>
          {activePanel && (
              <>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActivePanel(null)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90] cursor-pointer"
                />
                <QuickViewPanel type={activePanel} onClose={() => setActivePanel(null)} />
              </>
          )}
      </AnimatePresence>
    </footer>
  );
}
