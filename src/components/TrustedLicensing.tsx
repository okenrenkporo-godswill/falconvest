"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import Link from "next/link";
import { ShieldCheck, UserCheck } from "lucide-react";

export default function TrustedLicensing() {
  return (
    <section className="py-24 bg-white dark:bg-black transition-colors duration-500 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Soft Blue Card Box */}
        <div className="relative w-full rounded-[2.5rem] bg-[#eef4f5] dark:bg-[#1e3640] border border-[#33525c]/10 p-8 md:p-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Column 1: Trusted by Millions */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6 text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-900 flex items-center justify-center text-[#33525c] shadow-sm">
                <UserCheck size={24} />
              </div>
              <h3 className="text-3xl md:text-5xl font-black text-[#2a4550] dark:text-white tracking-tighter leading-tight uppercase">
                Trusted by millions of traders
              </h3>
              <p className="text-lg text-[#33525c] dark:text-neutral-300 leading-relaxed font-medium">
                Join a secure, globally recognized broker. Over 1 million users worldwide rely on Falcon to execute their transactions safely and efficiently, backed by top-tier banking partners and segregated storage assets.
              </p>
              <div className="pt-2">
                <Button
                  as={Link}
                  href="/register"
                  className="bg-[#33525c] hover:bg-[#2a4550] text-white font-black h-14 px-10 text-sm uppercase tracking-widest rounded-full shadow-lg shadow-[#33525c]/25"
                >
                  Open Free Account
                </Button>
              </div>
            </motion.div>

            {/* Column 2: Licensed and Regulated */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6 text-left border-t lg:border-t-0 lg:border-l border-black/10 dark:border-white/10 pt-12 lg:pt-0 lg:pl-16"
            >
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-900 flex items-center justify-center text-[#33525c] shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-3xl md:text-5xl font-black text-[#2a4550] dark:text-white tracking-tighter leading-tight uppercase">
                Licensed and regulated
              </h3>
              <p className="text-lg text-[#33525c] dark:text-neutral-300 leading-relaxed font-medium">
                Falcon is authorized and regulated in multiple jurisdictions, maintaining compliance under strictly enforced international financial services guidelines. We guarantee that your client funds are kept completely separate from the company's operational bank accounts.
              </p>
              <div className="flex items-center gap-3 bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl p-4">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
                  FSA License No. SD082 | Tier-1 Capital Standard Active
                </span>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}
