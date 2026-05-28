"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import Link from "next/link";
import PhoneFrame from "./PhoneFrame";
import Image from "next/image";

export default function UserFriendlyPlatform() {
  return (
    <section className="py-24 bg-white dark:bg-black transition-colors duration-500 overflow-hidden border-t border-black/5 dark:border-white/5">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Copy Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8 text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#33525c]/10 text-[#33525c]">
              <span className="text-[10px] font-black uppercase tracking-widest">Next-Gen Interface</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white tracking-tighter leading-[1.05]">
              A user-friendly <br/>
              <span className="text-[#33525c] italic">trading platform</span>
            </h2>
            
            <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
              Trade options on financial markets and 24/7 Derived Indices. Start with just USD 0.09, and choose from multiple contract types and durations to suit your trading strategy. Experience institutional execution at your fingertips.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                as={Link}
                href="/register"
                className="bg-[#33525c] hover:bg-[#2a4550] text-white font-black h-14 px-10 text-sm uppercase tracking-widest rounded-full shadow-lg shadow-[#33525c]/25"
              >
                Try Now
              </Button>
              <Button
                as={Link}
                href="/why-Falcon"
                variant="bordered"
                className="border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 h-14 px-10 text-sm uppercase tracking-widest rounded-full"
              >
                Learn More
              </Button>
            </div>
          </motion.div>

          {/* Right Column: Dynamic Mobile Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center z-10"
          >
            <div className="absolute inset-0 bg-[#33525c]/10 blur-[100px] rounded-full -z-10" />
            <PhoneFrame>
              <div className="absolute inset-0 bg-neutral-950 flex flex-col p-4 pt-12 overflow-hidden text-left">
                {/* Simulated App Header */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-[#33525c] rounded-lg flex items-center justify-center text-white font-black text-[9px]">F</div>
                    <span className="text-white text-xs font-black tracking-tight">Falcon</span>
                  </div>
                  <div className="px-2 py-0.5 rounded bg-green-500/20 text-green-500 text-[8px] font-black">LIVE FEED</div>
                </div>

                {/* Simulated Chart Widget */}
                <div className="bg-neutral-900 border border-white/5 rounded-2xl p-4 mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Derived Index Volatility 100</p>
                      <h4 className="text-lg font-black text-white">$14,258.90</h4>
                    </div>
                    <span className="text-green-500 text-[10px] font-black bg-green-500/10 px-1.5 py-0.5 rounded">+4.82%</span>
                  </div>
                  {/* Wave Graph SVG */}
                  <svg className="w-full h-24 stroke-green-500 fill-none" viewBox="0 0 100 40">
                    <path d="M0 30 Q 15 10 30 25 T 60 15 T 80 35 T 100 10" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Options Trade Form */}
                <div className="space-y-3 bg-neutral-900/50 border border-white/5 rounded-2xl p-4">
                  <div className="flex justify-between text-[9px] text-neutral-400 font-bold">
                    <span>MINIMUM START</span>
                    <span>CONTRACT TYPE</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-neutral-950 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                      <span className="text-xs font-black text-white">$0.09</span>
                      <span className="text-[8px] text-[#33525c] font-black">USD</span>
                    </div>
                    <div className="flex-1 bg-[#33525c]/10 border border-[#33525c]/20 rounded-xl p-3 text-center">
                      <span className="text-xs font-black text-[#33525c] uppercase tracking-wider">Derived Options</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-[#33525c] text-white font-black text-xs py-3.5 rounded-xl uppercase tracking-widest shadow-lg shadow-[#33525c]/20 hover:bg-[#2a4550] transition-colors">
                    Buy Rise Contract
                  </button>
                </div>
              </div>
            </PhoneFrame>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
