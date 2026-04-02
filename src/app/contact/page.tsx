"use client";

import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  HelpCircle, 
  ArrowRight, 
  Globe, 
  Clock,
  ChevronRight
} from "lucide-react";
import Image from "next/image";

const CONTACT_METHODS = [
  {
    country: "USA (Headquarters)",
    flag: "/images/logo1.png", // Using logo as placeholder if flag missing
    number: "+1 (800) 555-0199",
    type: "Toll Free",
    isUS: true
  },
  {
    country: "Seychelles",
    flag: "/images/logo1.png",
    number: "+248 467 1946",
    type: "Local Number"
  },
  {
    country: "Panama",
    flag: "/images/logo1.png",
    number: "+507 836 5501",
    type: "Local Number"
  }
];

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500">
      <Header />

      <main className="pt-32 pb-24">
        {/* HERO SECTION */}
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-4xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black text-black dark:text-white tracking-tighter uppercase mb-8"
            >
              Contact <span className="text-[#01C1D6]">us</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 leading-relaxed font-light"
            >
              If you have a question, but did not find an answer in our <span className="text-[#01C1D6] font-medium cursor-pointer hover:underline">Help Center</span>, please feel free to contact us directly. We are available Monday - Friday, 07:30 am - 02:00 am EEST.
            </motion.p>
          </div>
        </section>

        {/* EMAIL SUPPORT BAR */}
        <section className="container mx-auto px-6 mb-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#01C1D6] to-blue-600 p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-[#01C1D6] shadow-xl">
                <Mail size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl md:text-3xl font-bold">Have a question?</h3>
                <p className="text-blue-100 text-lg">Contact us via <span className="font-bold">e-mail</span></p>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-center md:text-right">
              <p className="text-sm text-blue-100 whitespace-nowrap">For client-related questions: <span className="font-bold text-white hover:underline cursor-pointer">support@synctrade.live</span></p>
              <p className="text-sm text-blue-100 whitespace-nowrap">For legal or licensing matters: <span className="font-bold text-white hover:underline cursor-pointer">info@synctrade.live</span></p>
            </div>
          </motion.div>
        </section>

        {/* PHONE NUMBERS SECTION */}
        <section className="container mx-auto px-6 mb-24">
          <div className="flex items-center gap-3 mb-12">
             <div className="w-10 h-10 rounded-xl bg-[#01C1D6]/10 flex items-center justify-center text-[#01C1D6]">
                <Globe size={20} />
             </div>
             <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight">International Phone Numbers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CONTACT_METHODS.map((method, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className={`p-8 rounded-3xl border transition-all duration-300 group ${
                  method.isUS 
                  ? "bg-neutral-50 dark:bg-neutral-900 border-[#01C1D6]/30 shadow-lg" 
                  : "bg-white dark:bg-neutral-900/40 border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-black/10 dark:border-white/10 relative">
                         <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800" />
                      </div>
                      <span className="font-bold text-neutral-500 dark:text-neutral-400 uppercase text-sm">{method.country}</span>
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">{method.type}</p>
                   <p className="text-2xl font-black text-black dark:text-white group-hover:text-blue-500 transition-colors">
                      {method.number}
                   </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
             <button className="bg-[#01C1D6] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-[#00ADC0] transition-all shadow-xl shadow-[#01C1D6]/20 active:scale-95">
                <MessageSquare size={20} />
                Live Chat Support
             </button>
          </div>
        </section>

        {/* NAVIGATION CARDS */}
        <section className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* FAQ CARD */}
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.6 }}
               className="relative overflow-hidden group cursor-pointer"
            >
               <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left z-20" />
               <div className="p-10 rounded-[2.5rem] bg-neutral-900 dark:bg-neutral-900/80 text-white flex items-center justify-between border border-white/5 shadow-2xl overflow-hidden relative">
                  <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-[#01C1D6] flex items-center justify-center shadow-lg shadow-[#01C1D6]/30">
                       <HelpCircle size={40} className="text-white" />
                    </div>
                    <div className="space-y-1">
                       <h3 className="text-2xl font-bold">Visit our FAQ Section</h3>
                       <p className="text-neutral-400 text-sm">Quick answers to common questions</p>
                    </div>
                  </div>
                  <ChevronRight size={32} className="text-neutral-600 group-hover:text-white transition-all group-hover:translate-x-2" />
                  {/* Decorative faint icon */}
                  <HelpCircle size={200} className="absolute -right-20 -bottom-20 text-white/[0.03] rotate-12" />
               </div>
            </motion.div>

            {/* HELP SECTION CARD */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.7 }}
               className="relative overflow-hidden group cursor-pointer"
            >
               <div className="absolute inset-x-0 bottom-0 h-1 bg-[#01C1D6] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left z-20" />
               <div className="p-10 rounded-[2.5rem] bg-neutral-900 dark:bg-neutral-900/80 text-white flex items-center justify-between border border-white/5 shadow-2xl overflow-hidden relative">
                  <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-[#01C1D6] flex items-center justify-center shadow-lg shadow-[#01C1D6]/30">
                       <MessageSquare size={40} className="text-white" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-xl font-bold text-neutral-400">Need Help?</h3>
                       <h3 className="text-2xl font-bold">Visit our Help Section</h3>
                    </div>
                  </div>
                  <ChevronRight size={32} className="text-neutral-600 group-hover:text-white transition-all group-hover:translate-x-2" />
                  {/* Decorative faint icon */}
                  <MessageSquare size={200} className="absolute -right-20 -bottom-20 text-white/[0.03] -rotate-12" />
               </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
