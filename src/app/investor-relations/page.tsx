"use client";

import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TrendingUp, PieChart, Landmark, FileBarChart, Presentation, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@heroui/react";

const REPORTS = [
  { title: "Q4 2025 Financial Results", date: "Jan 15, 2026", type: "Earnings" },
  { title: "Annual Shareholder Letter", date: "Dec 10, 2025", type: "Report" },
  { title: "Global Expansion Roadmap", date: "Nov 22, 2025", type: "Strategy" },
  { title: "Q3 2025 Financial Results", date: "Oct 20, 2025", type: "Earnings" }
];

export default function InvestorRelations() {
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500">
      <Header />

      <main className="pt-32 pb-24">
        {/* HERO */}
        <section className="container mx-auto px-6 mb-32">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] w-fit mb-6"
            >
              Corporate Governance
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black text-black dark:text-white tracking-tighter uppercase mb-8"
            >
              Investor <span className="text-[#01C1D6]">Hub.</span>
            </motion.h1>
            <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 font-light max-w-2xl leading-relaxed">
              We are committed to long-term value creation and absolute transparency for our global stakeholders and institutional partners.
            </p>
          </div>
        </section>

        {/* QUICK STATS */}
        <section className="container mx-auto px-6 mb-32 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-10 rounded-[2.5rem] bg-neutral-900 text-white relative overflow-hidden group">
              <TrendingUp size={100} className="absolute -right-5 -bottom-5 text-white/[0.03] group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">Market Cap</p>
              <h3 className="text-4xl font-black">$2.4B USD</h3>
           </div>
           <div className="p-10 rounded-[2.5rem] bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 relative overflow-hidden group">
              <Landmark size={100} className="absolute -right-5 -bottom-5 text-black/[0.02] dark:text-white/[0.03] group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#01C1D6] mb-2">Total Funding</p>
              <h3 className="text-4xl font-black text-black dark:text-white">$450M</h3>
           </div>
           <div className="p-10 rounded-[2.5rem] bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 relative overflow-hidden group">
              <PieChart size={100} className="absolute -right-5 -bottom-5 text-black/[0.02] dark:text-white/[0.03] group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0066ff] mb-2">Growth YoY</p>
              <h3 className="text-4xl font-black text-black dark:text-white">+114%</h3>
           </div>
        </section>

        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24">
           {/* LEFT: RECENT REPORTS */}
           <section className="space-y-12">
              <div className="space-y-4">
                 <h2 className="text-3xl font-black text-black dark:text-white uppercase tracking-tight">Recent Disclosures</h2>
                 <p className="text-neutral-500">Access our latest financial statements and strategic updates.</p>
              </div>
              <div className="space-y-4">
                 {REPORTS.map((report, i) => (
                   <div key={i} className="group p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-black/5 dark:border-white/5 flex items-center justify-between hover:bg-white dark:hover:bg-neutral-900 transition-all cursor-pointer">
                      <div className="flex items-center gap-6">
                         <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-neutral-400">
                            <FileBarChart size={20} />
                         </div>
                         <div>
                            <h4 className="font-bold text-black dark:text-white group-hover:text-[#01C1D6] transition-colors">{report.title}</h4>
                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">{report.type} • {report.date}</p>
                         </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-[#01C1D6] group-hover:text-white transition-all">
                         <ArrowRight size={16} />
                      </div>
                   </div>
                 ))}
              </div>
           </section>

           {/* RIGHT: UPCOMING EVENTS */}
           <section className="space-y-12">
              <div className="space-y-4">
                 <h2 className="text-3xl font-black text-black dark:text-white uppercase tracking-tight">Financial Calendar</h2>
                 <p className="text-neutral-500">Key dates for shareholder meetings and results briefings.</p>
              </div>
              <div className="space-y-6">
                 {[
                   { date: "MAR 15", event: "Q1 Earnings Webcast", time: "10:00 AM EST" },
                   { date: "APR 22", event: "Annual General Meeting", time: "02:30 PM EST" },
                   { date: "MAY 10", event: "Investor Day 2026", time: "All Day" }
                 ].map((ev, i) => (
                   <div key={i} className="flex gap-8 items-start border-l-2 border-[#01C1D6] pl-8 py-2">
                      <div className="text-[#01C1D6] font-black text-xl whitespace-nowrap">{ev.date}</div>
                      <div>
                         <h4 className="font-bold text-black dark:text-white uppercase tracking-tight text-lg">{ev.event}</h4>
                         <p className="text-neutral-500 text-sm font-medium mt-1">{ev.time}</p>
                      </div>
                   </div>
                 ))}
                 <div className="pt-8">
                    <Button className="bg-[#0066ff] text-white font-black uppercase text-xs tracking-widest px-8 rounded-xl h-12 flex items-center gap-2">
                       <Presentation size={14} />
                       Event Archive
                    </Button>
                 </div>
              </div>
           </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
