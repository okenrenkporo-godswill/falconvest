"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { Card, CardBody, Button } from "@heroui/react";
import { Handshake, Users, Globe2, BarChart } from "lucide-react";

export default function PartnershipsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      <main className="pt-20">
        <PageHero 
          badge="Collaborate"
          title="Partnership Programs" 
          subtitle="Grow your business and expand your reach by partnering with the world's leading institutional copy-trading platform."
        />

        <div className="container mx-auto px-6 lg:px-12 pb-24">
           <div className="grid md:grid-cols-2 gap-8 mb-16">
              <Card className="bg-neutral-50 dark:bg-neutral-900/40 border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                <CardBody className="p-10 flex flex-col items-start gap-6">
                   <div className="p-4 rounded-2xl bg-[#FF6347]/10 text-[#FF6347]">
                      <Users size={32} />
                   </div>
                   <h3 className="text-2xl font-black text-black dark:text-white uppercase tracking-tighter">Affiliate Program</h3>
                   <p className="text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                      Earn industry-leading commissions by introducing clients to MasterSync. Benefit from our high conversion rates and institutional brand reputation.
                   </p>
                   <ul className="space-y-3">
                      {["Up to 50% Revenue Share", "Real-time Tracking Dashboard", "Dedicated Account Manager"].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-black dark:text-white">
                           <div className="w-1.5 h-1.5 rounded-full bg-[#FF6347]" />
                           {item}
                        </li>
                      ))}
                   </ul>
                   <Button className="mt-4 bg-[#FF6347] text-white font-black uppercase tracking-widest rounded-2xl h-14 px-8 shadow-lg shadow-[#FF6347]/20">
                      Become an Affiliate
                   </Button>
                </CardBody>
              </Card>

              <Card className="bg-black text-white border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                <CardBody className="p-10 flex flex-col items-start gap-6">
                   <div className="p-4 rounded-2xl bg-white/10 text-white">
                      <Handshake size={32} />
                   </div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter">Institutional Partners</h3>
                   <p className="text-neutral-400 font-medium leading-relaxed">
                      White-label solutions and API integrations for brokers, fund managers, and financial institutions looking to offer copy-trading to their clients.
                   </p>
                   <ul className="space-y-3">
                      {["Custom Branding & UI", "Deep Institutional Liquidity", "Robust Risk Management Tools"].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-bold opacity-80">
                           <div className="w-1.5 h-1.5 rounded-full bg-[#FF6347]" />
                           {item}
                        </li>
                      ))}
                   </ul>
                   <Button className="mt-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl h-14 px-8">
                      Contact Institutional Desk
                   </Button>
                </CardBody>
              </Card>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-t border-black/5 dark:border-white/5">
               <div className="text-center">
                  <Globe2 className="mx-auto mb-4 text-[#FF6347]" size={32} />
                  <h4 className="text-2xl font-black text-black dark:text-white">120+</h4>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Countries</p>
               </div>
               <div className="text-center">
                  <BarChart className="mx-auto mb-4 text-[#FF6347]" size={32} />
                  <h4 className="text-2xl font-black text-black dark:text-white">$500M+</h4>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Volume Processed</p>
               </div>
               <div className="text-center">
                  <Users className="mx-auto mb-4 text-[#FF6347]" size={32} />
                  <h4 className="text-2xl font-black text-black dark:text-white">10K+</h4>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Active Partners</p>
               </div>
               <div className="text-center">
                  <Handshake className="mx-auto mb-4 text-[#FF6347]" size={32} />
                  <h4 className="text-2xl font-black text-black dark:text-white">24/7</h4>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Global Support</p>
               </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
