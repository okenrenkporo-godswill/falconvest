"use client";

import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText, ShieldAlert, Scale, ExternalLink, Download, Lock } from "lucide-react";

const DOCS = [
  {
    category: "General Terms",
    items: [
      { title: "Terms of Service", version: "V2.4 (Jan 2026)", size: "450 KB" },
      { title: "Privacy Policy", version: "V1.8 (Dec 2025)", size: "220 KB" },
      { title: "Cookie Policy", version: "V1.2 (Nov 2025)", size: "110 KB" }
    ]
  },
  {
    category: "Trading & Risk",
    items: [
      { title: "Risk Disclosure Notice", version: "V3.0 (Feb 2026)", size: "380 KB" },
      { title: "Execution Policy", version: "V2.1 (Jan 2026)", size: "290 KB" },
      { title: "Conflict of Interest Policy", version: "V1.5 (Oct 2025)", size: "180 KB" }
    ]
  },
  {
    category: "Compliance",
    items: [
      { title: "AML & KYC Policy", version: "V2.2 (Jan 2026)", size: "520 KB" },
      { title: "Complaint Management", version: "V1.4 (Aug 2025)", size: "140 KB" },
      { title: "Client Categorization", version: "V1.3 (Sep 2025)", size: "210 KB" }
    ]
  }
];

export default function Legal() {
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500">
      <Header />

      <main className="pt-32 pb-24">
        {/* HERO */}
        <section className="container mx-auto px-6 mb-24">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] w-fit mb-6 border border-orange-500/10"
            >
              Institutional Integrity
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black text-black dark:text-white tracking-tighter uppercase mb-8"
            >
              Legal <span className="text-neutral-400">Framework.</span>
            </motion.h1>
            <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 font-light max-w-2xl leading-relaxed">
              Transparent, compliant, and regulated. Download our full legal framework and governing documents.
            </p>
          </div>
        </section>

        {/* RISK WARNING BAR */}
        <section className="container mx-auto px-6 mb-24">
           <div className="p-8 md:p-12 rounded-[2.5rem] bg-orange-50 dark:bg-orange-500/5 border border-orange-500/20 flex flex-col md:flex-row items-center gap-10">
              <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/20 shrink-0">
                 <ShieldAlert size={32} />
              </div>
              <div>
                 <h2 className="text-xl font-bold text-black dark:text-white uppercase tracking-tight mb-2">High-Risk Warning</h2>
                 <p className="text-neutral-600 dark:text-neutral-500 text-sm italic">
                   Trading in leveraged financial instruments involves a high degree of risk and may result in the loss of all your invested capital. Please ensure you fully understand the risks involved before trading.
                 </p>
              </div>
           </div>
        </section>

        {/* DOCS GRID */}
        <section className="container mx-auto px-6">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {DOCS.map((group, gIdx) => (
                <div key={gIdx} className="space-y-8">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-neutral-400">
                         <Scale size={16} />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-black dark:text-white">{group.category}</h3>
                   </div>
                   <div className="space-y-4">
                      {group.items.map((doc, dIdx) => (
                        <motion.div 
                          key={dIdx}
                          initial={{ opacity: 0, scale: 0.98 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: dIdx * 0.1 }}
                          className="group p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 hover:border-[#FF6347]/30 transition-all cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-[#FF6347] transition-colors shadow-sm">
                                <FileText size={18} />
                             </div>
                             <div>
                                <h4 className="font-bold text-black dark:text-white text-sm group-hover:text-[#FF6347] transition-colors">{doc.title}</h4>
                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">{doc.version}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <span className="hidden md:block text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{doc.size}</span>
                             <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-black transition-all">
                                <Download size={16} />
                             </div>
                          </div>
                        </motion.div>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* COMPLIANCE FOOTER */}
        <section className="container mx-auto px-6 mt-32">
           <div className="p-16 rounded-[3rem] bg-neutral-950 text-center relative overflow-hidden">
              <Lock size={200} className="absolute -left-20 -bottom-20 text-white/[0.02] -rotate-12" />
              <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                 <h3 className="text-3xl font-black text-white uppercase tracking-tight">Security First. Always.</h3>
                 <p className="text-neutral-500 italic">MasterSync Limited is authorized and regulated by the Financial Services Authority (FSA). We maintain segregated client accounts and industry-standard security protocols for all assets.</p>
                 <div className="flex flex-wrap justify-center gap-6">
                    <div className="px-6 py-3 rounded-xl border border-white/10 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle size={14} className="text-blue-500" />
                       ISO 27001 Certified
                    </div>
                    <div className="px-6 py-3 rounded-xl border border-white/10 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle size={14} className="text-blue-500" />
                       FSA Regulated
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

const CheckCircle = ({ className, size }: { className?: string, size?: number }) => (
  <svg width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
