"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Fingerprint, Eye, CheckCircle2 } from "lucide-react";

const securityFeatures = [
  {
    icon: <Lock className="text-[#FF6347]" size={28} />,
    title: "Institutional Grade 2FA",
    desc: "Multi-layered authentication ensuring only you access your assets."
  },
  {
    icon: <Shield className="text-[#FF6347]" size={28} />,
    title: "Cold Storage Protection",
    desc: "98% of all digital assets are stored in disconnected offline environments."
  },
  {
    icon: <Fingerprint className="text-[#FF6347]" size={28} />,
    title: "Biometric Security",
    desc: "Advanced biometric protocols for mobile and desktop transactions."
  },
  {
    icon: <Eye className="text-[#FF6347]" size={28} />,
    title: "Real-time Monitoring",
    desc: "24/7 automated systems tracking for any suspicious activity."
  }
];

export default function SecurityCard() {
  return (
    <section className="py-24 bg-white dark:bg-black transition-colors duration-500 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-[#FF6347]/5 rounded-full blur-[120px] pointer-events-none opacity-50" />
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Visual Card */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative z-10 bg-neutral-50 dark:bg-neutral-900/50 border border-black/5 dark:border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[#FF6347]/10 flex items-center justify-center text-[#FF6347]">
                  <Shield size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-black dark:text-white uppercase tracking-tighter">Vault Protocol</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-neutral-900 dark:text-neutral-500 uppercase tracking-widest">Active Protection</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 {[
                   { label: "Data Encryption", status: "AES-256" },
                   { label: "Withdrawal Lock", status: "Enabled" },
                   { label: "IP Whitelisting", status: "Active" }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-black/40 border border-black/5 dark:border-white/5">
                      <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400">{item.label}</span>
                      <div className="flex items-center gap-2 text-[#FF6347]">
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.status}</span>
                        <CheckCircle2 size={14} />
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-10 p-6 rounded-3xl bg-black dark:bg-[#050505] text-white">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF6347] mb-2">Security Score</p>
                 <div className="flex items-end gap-3">
                    <span className="text-5xl font-black tracking-tighter">99.8%</span>
                    <span className="text-xs font-bold text-neutral-600 dark:text-neutral-500 mb-2 italic">Institutional Grade</span>
                 </div>
              </div>
            </div>

            {/* Floating Element */}
            <motion.div 
               animate={{ y: [0, -20, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -top-6 -right-6 p-4 rounded-2xl bg-[#FF6347] text-white shadow-2xl z-20 flex items-center gap-3"
            >
              <Lock size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure Core</span>
            </motion.div>
          </motion.div>

          {/* Right Side: Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col space-y-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FF6347]/20 bg-[#FF6347]/5 mb-6">
                <span className="text-[10px] font-black tracking-widest text-[#FF6347] uppercase">Safety First</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter leading-tight mb-6">
                Your Assets Are <br/>
                <span className="text-[#FF6347]">Guaranteed Secure.</span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium max-w-lg leading-relaxed">
                At MasterSync, we employ the most advanced security protocols in the industry to ensure your peace of mind.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {securityFeatures.map((f, i) => (
                <div key={i} className="space-y-3">
                  <div className="mb-2">
                    {f.icon}
                  </div>
                  <h4 className="text-sm font-black text-black dark:text-white uppercase tracking-tight">{f.title}</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
