"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner } from "@heroui/react";
import { Globe, ArrowRightLeft } from "lucide-react";

interface ForexPair {
  pair: string;
  rate: number;
  bid: number;
  ask: number;
}

import { useLiveMarkets, MarketAsset } from "@/hooks/useLiveMarkets";
import MarketEducation from "@/components/MarketEducation";

export default function ForexPage() {
  const { marketData, loading, lastUpdates } = useLiveMarkets();
  const data = marketData.Forex;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      <main className="pt-20">
        <PageHero 
          badge="Currencies"
          title="Forex Exchange" 
          subtitle="Access the world's largest financial market with competitive spreads and deep institutional liquidity."
        />

        <div className="container mx-auto px-6 lg:px-12 pb-24">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner color="danger" />
            </div>
          ) : (
            <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-black/5 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto no-scrollbar">
                <Table 
                  aria-label="Forex markets table"
                  className="min-w-[800px]"
                  removeWrapper
                >
                <TableHeader>
                  <TableColumn className="bg-transparent py-6 text-[10px] font-black uppercase tracking-widest text-neutral-900 dark:text-neutral-500">Currency Pair</TableColumn>
                  <TableColumn className="bg-transparent py-6 text-[10px] font-black uppercase tracking-widest text-neutral-900 dark:text-neutral-500">Institutional Rate</TableColumn>
                  <TableColumn className="bg-transparent py-6 text-[10px] font-black uppercase tracking-widest text-neutral-900 dark:text-neutral-500">Bid</TableColumn>
                  <TableColumn className="bg-transparent py-6 text-[10px] font-black uppercase tracking-widest text-neutral-900 dark:text-neutral-500">Ask</TableColumn>
                  <TableColumn className="bg-transparent py-6 text-[10px] font-black uppercase tracking-widest text-neutral-900 dark:text-neutral-500 text-right">Liquidity</TableColumn>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id} className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <TableCell className="py-6">
                        <div className="flex items-center gap-3">
                           <div className="p-2 rounded-lg bg-[#33525c]/10 text-[#33525c]">
                              <ArrowRightLeft size={16} />
                           </div>
                           <span className="font-black text-black dark:text-white uppercase tracking-tighter text-lg">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-mono font-bold transition-colors duration-500 ${lastUpdates[item.id] === true ? 'text-green-500' : lastUpdates[item.id] === false ? 'text-red-500' : 'text-[#33525c]'}`}>
                          {item.buy.toFixed(5)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-neutral-600 dark:text-neutral-500">{item.buy.toFixed(5)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-neutral-600 dark:text-neutral-500">{item.sell.toFixed(5)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full">
                           <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                           <span className="text-[9px] font-black uppercase tracking-widest">High</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          )}
        </div>
        <MarketEducation type="forex" />
      </main>
      <Footer />
    </div>
  );
}
