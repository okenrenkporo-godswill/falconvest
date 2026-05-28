"use client";

import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Star, Quote, CheckCircle } from "lucide-react";

const REVIEWS = [
  {
    name: "Alex Thompson",
    role: "Institutional Trader",
    content: "The latency on Falcon is genuinely impressive. I've switched my entire high-frequency operation here.",
    rating: 5
  },
  {
    name: "Sarah Chen",
    role: "Portfolio Manager",
    content: "The risk management tools are the best I've seen in the crypto space. Precision is the word I'd use.",
    rating: 5
  },
  {
    name: "Marco Rossi",
    role: "Day Trader",
    content: "The interface is beautiful but functional. It doesn't get in the way of the data. Absolute 10/10.",
    rating: 5
  },
  {
    name: "Elena Petrova",
    role: "Retail Investor",
    content: "Copy trading changed the game for me. I can follow the best pros without having to watch charts 24/7.",
    rating: 4
  },
  {
    name: "David Miller",
    role: "Algo Developer",
    content: "The API documentation is crystal clear. Built my custom bot integration in less than a weekend.",
    rating: 5
  },
  {
    name: "James Wilson",
    role: "Crypto Enthusiast",
    content: "Security was my main concern. Falcon's transparent cold storage and 2FA give me peace of mind.",
    rating: 5
  }
];

export default function Reviews() {
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
              className="px-4 py-1.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-[0.2em] w-fit mb-6"
            >
              Trust & Transparency
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black text-black dark:text-white tracking-tighter uppercase mb-6"
            >
              Real <span className="text-[#33525c]">Feedback.</span>
            </motion.h1>
            <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 font-light max-w-2xl">
              Don't just take our word for it. Join 2 million+ traders worldwide who have found their home at Falcon.
            </p>
          </div>
        </section>

        {/* OVERALL SCORE */}
        <section className="container mx-auto px-6 mb-24">
           <div className="p-12 rounded-[3rem] bg-neutral-900 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
              <div className="relative z-10 space-y-4 text-center md:text-left">
                 <h2 className="text-4xl font-black text-white uppercase tracking-tight">Excellent</h2>
                 <div className="flex items-center justify-center md:justify-start gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={24} fill="#22c55e" className="text-green-500" />
                    ))}
                 </div>
                 <p className="text-neutral-400 font-medium italic">Based on 50,000+ TrustSync Verified Reviews</p>
              </div>
              <div className="relative z-10 h-full w-[1px] bg-white/10 hidden md:block" />
              <div className="relative z-10 flex flex-wrap justify-center gap-12">
                 <div className="text-center">
                    <p className="text-5xl font-black text-white mb-2">4.8</p>
                    <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">App Store</p>
                 </div>
                 <div className="text-center">
                    <p className="text-5xl font-black text-white mb-2">4.9</p>
                    <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">TrustPilot</p>
                 </div>
                 <div className="text-center">
                    <p className="text-5xl font-black text-white mb-2">4.7</p>
                    <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Play Store</p>
                 </div>
              </div>
              <Star size={300} className="absolute -right-20 -bottom-20 text-white/[0.02] rotate-12" />
           </div>
        </section>

        {/* REVIEWS GRID */}
        <section className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {REVIEWS.map((review, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[2.5rem] bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex gap-0.5">
                      {[...Array(review.rating)].map((_, r) => (
                        <Star key={r} size={14} fill="#33525c" className="text-[#33525c]" />
                      ))}
                    </div>
                    <Quote size={28} className="text-neutral-100 dark:text-neutral-800" />
                  </div>
                  <p className="text-lg text-black dark:text-white font-medium leading-relaxed mb-8">
                    "{review.content}"
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-8 border-t border-black/5 dark:border-white/5">
                   <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-black text-[#33525c]">
                      {review.name[0]}
                   </div>
                   <div>
                      <p className="font-bold text-black dark:text-white flex items-center gap-1.5">
                         {review.name}
                         <CheckCircle size={14} className="text-blue-500" />
                      </p>
                      <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">{review.role}</p>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
