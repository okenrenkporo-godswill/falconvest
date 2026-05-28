"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { TrendingUp, UserCheck, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutUsCopy() {
  return (
    <section className="py-24 bg-white dark:bg-black transition-colors duration-500 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">

        {/* Outer Section Title */}
        <div className="text-left mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#33525c] mb-2">Who We Are</p>
          <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white tracking-tighter">About Us</h2>
        </div>

        {/* Soft Blue Card Container */}
        <div className="relative w-full rounded-[2.5rem] bg-[#eef4f5] dark:bg-[#1e3640] border border-[#33525c]/10 p-8 md:p-16 flex flex-col lg:flex-row gap-16 items-center">

          {/* Left Column: Bold Action Pitch */}
          <div className="flex-1 space-y-6 text-left relative z-10">
            <h3 className="text-1xl md:text-1xl font-black text-[#1e3640] dark:text-white tracking-tighter leading-[1.05] uppercase">
              TIME TO TAKE ACTION WITH THE INTERNATIONAL FALCONVEST PRO COPY TRADING BROKER
            </h3>

            <p className="text-lg text-[#33525c] dark:text-neutral-300 leading-relaxed font-medium">
              Trading will bring you consistent returns with the right support system. FalconVest connects beginner traders directly with world-class financial professionals. Simply choose your preferred experts, click sync, and let their trades replicate inside your portfolio in real time.
            </p>

            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-semibold italic">
              "From educational broker tools to highly transparent copy solutions—your automated success is our mandate."
            </p>
            <div className="pt-4"></div>

          </div>

          {/* Right Column: About Us Image */}
          <div className="flex-1 w-full relative min-h-[450px] lg:min-h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-[#33525c]/10">
            <Image
              src="/images/about.jpeg"
              alt="FalconVest About Us"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {/* Subtle premium gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
