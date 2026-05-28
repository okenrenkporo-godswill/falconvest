"use client";

import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";

const POSTS = [
  {
    title: "The Institutional Shift: Why 2026 is the Year of Crypto Adoption",
    excerpt: "Exploring the fundamental changes in global finance and how Falcon is leading the infrastructure revolution.",
    date: "Feb 08, 2026",
    readTime: "6 min",
    category: "Insights"
  },
  {
    title: "Mastering the Art of Copy Trading: A Strategic Guide",
    excerpt: "How to identify the best traders to follow and manage your risk profile effectively for long-term growth.",
    date: "Feb 05, 2026",
    readTime: "12 min",
    category: "Guides"
  },
  {
    title: "Security Update: Advanced Cold Storage Protocols",
    excerpt: "A deep dive into Falcon's industry-leading security architecture and our commitment to asset safety.",
    date: "Feb 01, 2026",
    readTime: "8 min",
    category: "News"
  }
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500">
      <Header />

      <main className="pt-32 pb-24">
        {/* HERO */}
        <section className="container mx-auto px-6 mb-24">
          <div className="flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-1.5 rounded-full bg-[#33525c]/10 text-[#33525c] text-[10px] font-black uppercase tracking-[0.2em] w-fit mb-6"
              >
                Market News & Analysis
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-9xl font-black text-black dark:text-white tracking-tighter uppercase mb-6 leading-[0.8]"
              >
                Insights <span className="text-neutral-400">&</span> Updates.
              </motion.h1>
              <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 font-light max-w-2xl leading-relaxed">
                Stay updated with the latest market trends, technical deep-dives, and platform announcements from the Falcon team.
              </p>
            </div>
            <div className="flex gap-4">
               {["All", "Insights", "Guides", "News"].map((cat, i) => (
                 <button key={i} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${i === 0 ? "bg-[#33525c] text-white shadow-lg shadow-[#33525c]/20" : "bg-black/5 dark:bg-white/5 text-neutral-500 hover:text-black dark:hover:text-white"}`}>
                    {cat}
                 </button>
               ))}
            </div>
          </div>
        </section>

        {/* FEED */}
        <section className="container mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {POSTS.map((post, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group cursor-pointer flex flex-col"
                >
                  <div className="h-64 rounded-[2rem] bg-neutral-100 dark:bg-neutral-900 overflow-hidden mb-8 relative border border-black/5 dark:border-white/5">
                     <div className="absolute inset-x-0 bottom-0 h-1 bg-[#33525c] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left z-20" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                        <ArrowRight size={40} className="text-white -rotate-45" />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-[#33525c] text-[10px] font-black uppercase tracking-[0.2em]">{post.category}</span>
                        <div className="flex items-center gap-3 text-neutral-400 text-xs font-medium">
                           <span className="flex items-center gap-1.5"><Calendar size={14} /> {post.date}</span>
                           <span className="flex items-center gap-1.5"><Clock size={14} /> {post.readTime}</span>
                        </div>
                     </div>
                     <h3 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight group-hover:text-[#33525c] transition-colors leading-snug">{post.title}</h3>
                     <p className="text-neutral-500 font-medium leading-relaxed">{post.excerpt}</p>
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
