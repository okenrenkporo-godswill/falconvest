"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { Avatar, Card, CardHeader, CardBody, Divider } from "@heroui/react";
import { MessageSquare, Repeat2, Heart, Share2 } from "lucide-react";

const feedData = [
  {
    user: "Alex Thompson",
    role: "Expert Trader",
    content: "Just hit a +15% return on my EUR/USD position! The market volatility is high today, but staying disciplined pays off. 🚀",
    stats: "ROI +42% (30d)",
    time: "2h ago"
  },
  {
    user: "Sarah Chen",
    role: "Equity Specialist",
    content: "Watching NVIDIA closely before the opening bell. Strong momentum persists. My copy-traders have been alerted. #Stocks #NVDA",
    stats: "Win Rate 88%",
    time: "4h ago"
  },
  {
    user: "Marco Rossi",
    role: "Crypto Veteran",
    content: "Accumulating Bitcoin at these levels. Long-term outlook remains bullish. Institutional inflows are just starting. 💎🙌",
    stats: "Copyers: 2,491",
    time: "6h ago"
  }
];

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      <main className="pt-20">
        <PageHero 
          badge="Community"
          title="Social Hub" 
          subtitle="Connect with the world's most successful traders. Share insights, discuss strategies, and mirror success directly."
        />

        <div className="container mx-auto px-6 lg:px-12 pb-24 max-w-4xl">
           <div className="space-y-8">
              {feedData.map((post, i) => (
                <Card key={i} className="bg-neutral-50 dark:bg-neutral-900/40 border-none shadow-xl rounded-[2.5rem] p-4">
                  <CardHeader className="flex gap-4 p-6">
                    <Avatar 
                      isBordered 
                      radius="full" 
                      size="lg" 
                      src={`https://i.pravatar.cc/150?u=${post.user}`} 
                      className="border-[#FF6347]"
                    />
                    <div className="flex flex-col gap-1 items-start justify-center">
                      <h4 className="text-lg font-black text-black dark:text-white leading-none">{post.user}</h4>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold text-[#FF6347] uppercase tracking-widest">{post.role}</span>
                         <span className="text-xs text-neutral-500">•</span>
                         <span className="text-xs text-neutral-500">{post.time}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="px-6 py-0 pb-6">
                    <p className="text-base text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed mb-6">
                      {post.content}
                    </p>
                    <div className="p-4 rounded-2xl bg-white dark:bg-black/40 border border-black/5 dark:border-white/5 mb-8 flex justify-between items-center">
                       <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Performance</span>
                       <span className="text-sm font-black text-[#FF6347]">{post.stats}</span>
                    </div>
                    
                    <Divider className="opacity-10 mb-6" />
                    
                    <div className="flex justify-between px-2 text-neutral-500">
                       <button className="flex items-center gap-2 hover:text-[#FF6347] transition-colors">
                          <Heart size={18} />
                          <span className="text-xs font-bold">Like</span>
                       </button>
                       <button className="flex items-center gap-2 hover:text-[#FF6347] transition-colors">
                          <MessageSquare size={18} />
                          <span className="text-xs font-bold">Discuss</span>
                       </button>
                       <button className="flex items-center gap-2 hover:text-[#FF6347] transition-colors">
                          <Repeat2 size={18} />
                          <span className="text-xs font-bold">Copy Trade</span>
                       </button>
                       <button className="flex items-center gap-2 hover:text-white transition-colors">
                          <Share2 size={18} />
                       </button>
                    </div>
                  </CardBody>
                </Card>
              ))}
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
