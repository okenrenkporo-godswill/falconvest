"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Video, BookOpen, TrendingUp, ShieldCheck } from "lucide-react";
import Link from "next/link";

const highlights = [
  {
    icon: BookOpen,
    title: "Market Fundamentals",
    desc: "Understand price action, order types, and core trading principles.",
  },
  {
    icon: TrendingUp,
    title: "Advanced Strategies",
    desc: "Learn technical analysis, risk management, and proven setups.",
  },
  {
    icon: ShieldCheck,
    title: "Risk Management",
    desc: "Protect your capital with disciplined position sizing and stop losses.",
  },
];

export default function EducationSection() {
  return (
    <section className="py-24 bg-white dark:bg-black transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 rounded-full">
            Trader Intelligence Hub
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white leading-tight">
            The Market Doesn&apos;t Wait.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
              Neither Should You.
            </span>
          </h2>
          <p className="text-neutral-500 dark:text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Stop guessing. Start understanding. Falcon&apos;s intelligence hub breaks
            down complex markets into clear, actionable knowledge — so every
            trade you place is backed by insight, not impulse.
          </p>
        </motion.div>

        {/* Main Grid: Video + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: YouTube Video Embed */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-white/10 relative group"
          >
            {/* Glow effect behind video */}
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-90 -z-10 group-hover:bg-emerald-500/30 transition-all duration-700" />

            <iframe
              className="w-full h-full relative z-10"
              src="https://www.youtube.com/embed/Gc2en3nHxA4?autoplay=0&rel=0&modestbranding=1"
              title="What is Bitcoin? — Falcon Trading Education"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            {/* About Bitcoin card */}
            <div className="bg-neutral-50 dark:bg-neutral-900/60 rounded-2xl p-6 border border-neutral-200 dark:border-white/5 shadow-sm">
              <h3 className="text-xl font-bold mb-3 text-black dark:text-white">
                What is Bitcoin?
              </h3>
              <p className="text-neutral-600 dark:text-white/60 text-sm leading-relaxed">
                Bitcoin (₿) is a decentralized digital currency that operates
                without a central authority. Transactions are verified by
                network nodes through cryptography and recorded on a public
                distributed ledger called a blockchain. Created in 2008 by
                Satoshi Nakamoto, Bitcoin pioneered the concept of
                cryptocurrencies and peer-to-peer value transfer.
              </p>
            </div>

            {/* Highlight items */}
            <ul className="space-y-4">
              {highlights.map(({ icon: Icon, title, desc }, i) => (
                <motion.li
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                  className="flex items-start gap-4"
                >
                  <div className="mt-0.5 p-2 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-black dark:text-white text-sm">
                      {title}
                    </p>
                    <p className="text-neutral-500 dark:text-white/50 text-xs leading-relaxed mt-0.5">
                      {desc}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/education" id="education-explore-btn">
                <button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20">
                  Explore Resources <GraduationCap size={18} />
                </button>
              </Link>
              {/* <Link href="/webinars" id="education-webinars-btn">
                <button className="w-full sm:w-auto bg-transparent border border-neutral-300 dark:border-white/20 hover:border-emerald-500 dark:hover:border-emerald-500 text-black dark:text-white font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  Free Webinars <Video size={18} />
                </button>
              </Link> */}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
