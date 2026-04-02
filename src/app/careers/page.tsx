"use client";

import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Briefcase, MapPin, Zap, Coffee, Heart, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@heroui/react";

const JOBS = [
  {
    title: "Senior Backend Engineer",
    dept: "Engineering",
    location: "USA (Remote)",
    type: "Full-Time"
  },
  {
    title: "Market Operations Lead",
    dept: "Operations",
    location: "USA (Hybrid)",
    type: "Full-Time"
  },
  {
    title: "Product Designer (UI/UX)",
    dept: "Product",
    location: "Global Remote",
    type: "Contract"
  },
  {
    title: "Legal & Compliance Officer",
    dept: "Legal",
    location: "Seychelles",
    type: "Full-Time"
  }
];

export default function Careers() {
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500">
      <Header />

      <main className="pt-32 pb-24">
        {/* HERO */}
        <section className="container mx-auto px-6 mb-32">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              We're Hiring
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-9xl font-black text-black dark:text-white tracking-tighter uppercase leading-[0.8]"
            >
              Build the <span className="text-[#01C1D6]">Future.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 font-light leading-relaxed max-w-2xl"
            >
              SyncTrade is looking for bold thinkers, fast learners, and obsessed builders who want to redefine global finance together.
            </motion.p>
          </div>
        </section>

        {/* WHY WORK HERE CULTURAL SECTION */}
        <section className="bg-neutral-900 overflow-hidden relative py-32 mb-32">
           <div className="container mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
              <div className="space-y-6">
                 <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-[#01C1D6] mx-auto border border-white/5">
                    <Zap size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-white uppercase tracking-tight">Move Fast</h3>
                 <p className="text-neutral-500 text-sm italic">We ship features daily. Speed is our superpower and our competitive edge.</p>
              </div>
              <div className="space-y-6">
                 <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-[#01C1D6] mx-auto border border-white/5">
                    <Heart size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-white uppercase tracking-tight">Radical Trust</h3>
                 <p className="text-neutral-500 text-sm italic">We hire the best and let them lead. No micromanagement, just results.</p>
              </div>
              <div className="space-y-6">
                 <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-[#01C1D6] mx-auto border border-white/5">
                    <Rocket size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-white uppercase tracking-tight">Big Impact</h3>
                 <p className="text-neutral-500 text-sm italic">Your work will reach 2M+ users from day one. Scale things that matter.</p>
              </div>
           </div>
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#01C1D6]/5 rounded-full blur-[150px] -z-0" />
        </section>

        {/* OPEN ROLES */}
        <section className="container mx-auto px-6">
           <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
              <div className="space-y-4">
                 <h2 className="text-4xl font-black text-black dark:text-white uppercase tracking-tight">Open Opportunities</h2>
                 <p className="text-neutral-500">Find your place in the SyncTrade story.</p>
              </div>
              <div className="h-10 px-4 rounded-xl border border-black/5 dark:border-white/10 flex items-center gap-2 text-xs font-bold text-neutral-400">
                 <MapPin size={14} />
                 All Locations
              </div>
           </div>

           <div className="space-y-4">
              {JOBS.map((job, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-8 md:p-12 rounded-[2.5rem] bg-neutral-50 dark:bg-neutral-900/40 border border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 hover:bg-white dark:hover:bg-neutral-900 hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-8 text-center md:text-left">
                    <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-neutral-400">
                       <Briefcase size={20} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-black dark:text-white uppercase group-hover:text-[#01C1D6] transition-colors">{job.title}</h3>
                       <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">{job.dept} • {job.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                     <span className="text-sm font-bold text-neutral-400 flex items-center gap-2">
                        <MapPin size={14} />
                        {job.location}
                     </span>
                     <div className="w-12 h-12 rounded-full border border-black/5 dark:border-white/10 flex items-center justify-center group-hover:bg-[#01C1D6] group-hover:text-white transition-all group-hover:translate-x-2">
                        <ArrowRight size={20} />
                     </div>
                  </div>
                </motion.div>
              ))}
           </div>
           
           <div className="mt-20 text-center p-16 rounded-[3rem] border border-dashed border-black/10 dark:border-white/10">
              <p className="text-lg text-neutral-500 mb-8 italic">Don't see a role that fits? Tag us anyway.</p>
              <Button className="bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs tracking-widest px-10 h-14 rounded-2xl">
                 Speculative Application
              </Button>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
