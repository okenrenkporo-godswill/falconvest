"use client";

import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Search, HelpCircle, BookOpen, PlayCircle, MessageCircle, ArrowUpRight } from "lucide-react";

const TOPICS = [
  { icon: BookOpen, title: "Getting Started", count: 12 },
  { icon: PlayCircle, title: "Video Tutorials", count: 8 },
  { icon: HelpCircle, title: "Account & Security", count: 15 },
  { icon: MessageCircle, title: "Trading Guides", count: 22 }
];

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500">
      <Header />

      <main className="pt-32 pb-24">
        {/* HERO / SEARCH */}
        <section className="bg-neutral-900 py-32 mb-24 relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10 text-center space-y-12">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter"
            >
              How can we <span className="text-[#FF6347]">help?</span>
            </motion.h1>
            
            <div className="max-w-2xl mx-auto relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-500 group-hover:text-white transition-colors" size={24} />
              <input 
                 type="text" 
                 placeholder="Search for articles, guides, and more..."
                 className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-white text-lg focus:outline-none focus:border-[#FF6347]/50 transition-all placeholder:text-neutral-600"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">
               <span>Popular:</span>
               <button className="text-white hover:text-[#FF6347] transition-colors underline decoration-[#FF6347]">KYC Verification</button>
               <button className="text-white hover:text-[#FF6347] transition-colors underline decoration-[#FF6347]">API Integration</button>
               <button className="text-white hover:text-[#FF6347] transition-colors underline decoration-[#FF6347]">Withdrawal Limits</button>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-[#FF6347]/5 blur-[120px]" />
        </section>

        {/* TOPICS GRID */}
        <section className="container mx-auto px-6 mb-32">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {TOPICS.map((topic, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-10 rounded-[2.5rem] bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 hover:border-[#FF6347] transition-all group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#FF6347]/10 flex items-center justify-center text-[#FF6347] mb-8 group-hover:scale-110 transition-transform">
                     <topic.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-2 uppercase tracking-tight">{topic.title}</h3>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-[0.2em]">{topic.count} Articles</p>
                </motion.div>
              ))}
           </div>
        </section>

        {/* FEATURED ARTICLES */}
        <section className="container mx-auto px-6">
           <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black text-black dark:text-white uppercase tracking-tight">Featured Articles</h2>
              <button className="text-[#FF6347] text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                All Articles <ArrowUpRight size={14} />
              </button>
           </div>

           <div className="grid md:grid-cols-2 gap-6">
              {[
                "How to activate 2FA on your account",
                "Understanding Spot vs Futures trading fees",
                "Institutional API key management best practices",
                "Withdrawal processing times and regional banks"
              ].map((art, i) => (
                <div key={i} className="group p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-black/5 dark:border-white/5 flex items-center justify-between hover:bg-white dark:hover:bg-neutral-900 transition-all cursor-pointer">
                   <h4 className="font-bold text-black dark:text-white group-hover:text-[#FF6347] transition-colors">{art}</h4>
                   <ArrowUpRight size={20} className="text-neutral-400 group-hover:text-[#FF6347] transition-colors" />
                </div>
              ))}
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
