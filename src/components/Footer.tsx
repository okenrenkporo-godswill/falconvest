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

// --- Types & Data ---

type PanelType = "help" | "faq" | "legal" | "about" | "support" | "contact" | null;

const FOOTER_LINKS = [
  {
    title: "Markets",
    links: ["Forex", "CryptoX", "Shares", "Real Stocks", "Crypto", "Indices", "Commodities", "Futures", "ETFs"]
  },
  {
    title: "Platforms",
    links: ["MasterSync Web", "Sync iOS", "Sync Android", "MT5 Terminal", "Telegram Mini App"]
  },
  {
    title: "Pricing & Terms",
    links: ["Hours & Fees", "Trading Holidays", "Deposit Methods", "Execution Policy", "Spreads"]
  },
  {
    title: "Company",
    links: [
        { name: "Why MasterSync", action: "about" },
        "Sponsorship", 
        { name: "Contact Us", action: "contact" }, 
        "Investors Relations", 
        "Reviews", 
        "Careers"
    ]
  },
  {
    title: "Documentation",
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
    title: "Partnerships",
    links: ["Institutional", "Affiliates", "IB Program"]
  },
  {
    title: "Help & Support",
    links: [
        { name: "Help Center", action: "help" },
        { name: "FAQ", action: "faq" },
        { name: "Contact us", action: "contact" }, 
        { name: "Customer Support", action: "support" }
    ]
  },
  {
    title: "Social Hub",
    links: ["Social Trading", "Copy Trading", "Leaderboard", "Become a Top Trader"]
  },
  {
    title: "Free Education",
    links: ["Master Academy", "Encyclopedia", "Currency Converter", "Webinars"]
  },
  {
    title: "News & Analysis",
    links: ["Market Updates", "Earnings Calendar", "Economic Calendar", "Sync Insights"]
  }
];

// --- Components ---

const QuickViewPanel = ({ type, onClose }: { type: PanelType; onClose: () => void }) => {
    if (!type) return null;

    const content = {
        help: {
            title: "Help Center",
            description: "How can we assist you today?",
            items: [
                { title: "Account Verification", desc: "Guide to completing your KYC process." },
                { title: "Deposit & Withdrawal", desc: "Detailed steps for managing your funds." },
                { title: "Trading Platforms", desc: "Tutorials on using MT5 and Web Trader." },
                { title: "Security Settings", desc: "Enable 2FA and secure your account." }
            ]
        },
        faq: {
            title: "Quick FAQ",
            description: "Common questions answered.",
            items: [
                { title: "What are the fees?", desc: "Starts at 0% for major pairs with minimal spreads." },
                { title: "Is my data secure?", desc: "We use AES-256 encryption and institutional custody." },
                { title: "Max leverage?", desc: "Up to 1:500 for eligible professional accounts." }
            ]
        },
        legal: {
            title: "Policy & Legal",
            description: "Transparency and protection.",
            items: [
                { title: "Privacy Policy", desc: "How we handle and protect your data." },
                { title: "Terms of Service", desc: "The agreement between you and MasterSync." },
                { title: "Risk Disclosure", desc: "Understanding the nature of CFD trading." }
            ]
        },
        about: {
            title: "About MasterSync",
            description: "Redefining the standard of trading.",
            items: [
                { title: "Our Mission", desc: "Democratizing institutional financial tools." },
                { title: "Global Reach", desc: "Serving clients in over 120 countries." },
                { title: "Innovation", desc: "Building the world's most intuitive interface." }
            ]
        },
        support: {
            title: "Customer Support",
            description: "24/7 technical and trading assistance.",
            items: [
                { title: "Live Chat", desc: "Speak directly with our technical team in seconds." },
                { title: "Ticket System", desc: "Submit a detailed request for complex issues." },
                { title: "VIP Support", desc: "Priority handling for Premium and Gold members." }
            ]
        },
        contact: {
            title: "Contact Us",
            description: "We're here to hear from you.",
            items: [
                { title: "Office HQ", desc: "Sync Tower, Financial District, London, UK." },
                { title: "Email Us", desc: "support@mastersync.global | partners@mastersync.global" },
                { title: "Call Direct", desc: "+44 (20) 7946 0123 (UK) | +1 (800) 555-0199 (US)" }
            ]
        }
    }[type];

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
                    <div className="w-10 h-10 rounded-xl bg-[#FF6347]/10 flex items-center justify-center text-[#FF6347]">
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
                        className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#FF6347]/30 transition-all cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-black dark:text-white group-hover:text-[#FF6347] transition-colors">{item.title}</h3>
                            <ChevronRight size={16} className="text-neutral-400 dark:text-neutral-600 transition-transform group-hover:translate-x-1" />
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-500 leading-relaxed">{item.desc}</p>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-[#FF6347]/10 to-transparent border border-[#FF6347]/10 text-center">
                <p className="text-sm text-neutral-400 mb-4">Still need more information?</p>
                <Button as={Link} href="/help-center" className="bg-[#FF6347] text-white font-bold w-full rounded-xl">
                    Full Help Center
                </Button>
            </div>
        </motion.div>
    );
};

export default function Footer() {
  const [activePanel, setActivePanel] = useState<PanelType>(null);

  const renderLinkGroup = (group: any) => (
    <div key={group.title} className="flex flex-col gap-4">
      <h3 className="text-black dark:text-white font-black text-sm uppercase tracking-widest">{group.title}</h3>
      <div className="flex flex-col gap-2.5">
        {group.links.map((link: any, i: number) => {
            const isObj = typeof link === 'object';
            const label = isObj ? link.name : link;
            const action = isObj ? link.action : null;
            
            // Map known labels to specific routes, default others to /register
            let href = "/register";
            if (label === "Why MasterSync") href = "/why-mastersync";
            if (label === "Reviews") href = "/reviews";
            if (label === "Careers") href = "/careers";
            if (label === "Investors Relations") href = "/investor-relations";
            
            // Markets
            if (label === "Forex") href = "/markets/forex";
            if (label === "Crypto") href = "/markets/crypto";
            if (label === "Real Stocks" || label === "Shares") href = "/markets/stocks";

            if (action) {
                return (
                    <button 
                      key={i} 
                      onClick={() => setActivePanel(action as PanelType)}
                      className="text-neutral-600 dark:text-neutral-500 text-xs font-medium hover:text-[#FF6347] transition-colors text-left w-fit flex items-center gap-1 group"
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
                  className="text-neutral-600 dark:text-neutral-500 text-xs font-medium hover:text-[#FF6347] transition-colors text-left w-fit flex items-center gap-1 group"
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
                        <Image src="/images/logo.png" alt="MasterSync" fill className="object-contain" />
                    </div>
                    <span className="text-2xl font-black text-black dark:text-white tracking-tighter uppercase italic">
                        MasterSync
                    </span>
                </div>
                <p className="text-neutral-500 text-sm leading-relaxed">
                    Revolutionizing institutional-grade trading through accessible technology, absolute transparency, and unyielding security.
                </p>
                <div className="flex items-center gap-4">
                    {[Twitter, Instagram, Facebook, Linkedin].map((Icon, i) => (
                        <button key={i} className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-neutral-600 dark:text-neutral-500 hover:text-white hover:bg-[#FF6347] transition-all">
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
                        <p className="text-black dark:text-white text-sm font-bold">Secured & Verified</p>
                        <p className="text-neutral-600 dark:text-neutral-500 text-xs">Tier-1 Bank Liquidity</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-black dark:text-white">
                        <Globe size={20} />
                    </div>
                    <div>
                        <p className="text-black dark:text-white text-sm font-bold">Global Presence</p>
                        <p className="text-neutral-600 dark:text-neutral-500 text-xs">Licensed in 40+ Regions</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-black dark:text-white">
                        <CreditCard size={20} />
                    </div>
                    <div>
                        <p className="text-black dark:text-white text-sm font-bold">Safe Funding</p>
                        <p className="text-neutral-600 dark:text-neutral-500 text-xs">Instant Payouts 24/7</p>
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
                        Risk Warning: Trading financial instruments involves significant risk. The value of investments can go down as well as up and you may receive back less than you originally invested. MasterSync Limited is authorized and regulated by the Financial Services Authority (FSA). Please ensure you fully understand the risks involved by reading our full risk disclosure or consulting an independent financial advisor.
                    </p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                    <Link href="#" className="text-[10px] text-neutral-600 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors font-black uppercase tracking-widest">Compliance</Link>
                    <Link href="#" className="text-[10px] text-neutral-600 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors font-black uppercase tracking-widest">Ethics</Link>
                    <Link href="#" className="text-[10px] text-neutral-600 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors font-black uppercase tracking-widest">Security</Link>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-neutral-600 dark:text-neutral-500">
                    © 2026 MasterSync Global. All Rights Reserved.
                </p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-neutral-500 font-mono">System Online: LDN-01 Stable</span>
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
