"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner } from "@heroui/react";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { useLiveMarkets, MarketAsset } from "@/hooks/useLiveMarkets";
import MarketEducation from "@/components/MarketEducation";

const PriceCell = ({ value, isUp }: { value: number; isUp: boolean | null }) => {
  return (
    <span className={`font-mono font-bold transition-colors duration-500 ${
      isUp === true ? "text-green-500" : isUp === false ? "text-red-500" : "text-black dark:text-white"
    }`}>
      ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
};

export default function StocksPage() {
  const { marketData, loading, lastUpdates } = useLiveMarkets();
  
  // Combine Indices and Shares for a comprehensive view
  const data = [...(marketData.Indices || []), ...(marketData.Shares || [])];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      <main className="pt-20">
        <PageHero 
          badge="Global Equities"
          title="Stock Markets" 
          subtitle="Trade major global indices and elite equities with institutional-grade execution and real-time market insights."
        />

        {/* Stock Video Section */}
        {/* <div className="container mx-auto px-6 lg:px-12 py-16">
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-[#FF6347]/10 blur-[120px] -z-10" />
            <div className="relative rounded-[2.5rem] overflow-hidden border border-black/5 dark:border-white/5 shadow-2xl">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-auto"
              >
                <source src="/images/stock.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div> */}

        <div className="container mx-auto px-6 lg:px-12 pb-24">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Spinner color="danger" />
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Retrieving Market Data...</p>
            </div>
          ) : (
            <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-black/5 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto no-scrollbar">
                <Table 
                  aria-label="Stocks markets table"
                  className="min-w-[800px]"
                  removeWrapper
                >
                <TableHeader>
                  <TableColumn className="bg-transparent py-8 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-400">Instrument</TableColumn>
                  <TableColumn className="bg-transparent py-8 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-400 text-right">Price</TableColumn>
                  <TableColumn className="bg-transparent py-8 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-400 text-right">24H Change</TableColumn>
                  <TableColumn className="bg-transparent py-8 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-400">Category</TableColumn>
                  <TableColumn className="bg-transparent py-8 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-400 text-right">Action</TableColumn>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id} className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                      <TableCell className="py-8 px-8">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-white dark:bg-black border border-black/5 dark:border-white/5 flex items-center justify-center overflow-hidden shadow-sm">
                              <div className="p-2 rounded-lg bg-[#FF6347]/10 text-[#FF6347]">
                                <TrendingUp size={16} />
                              </div>
                           </div>
                           <div>
                              <p className="font-black text-black dark:text-white uppercase tracking-tighter text-lg group-hover:text-[#FF6347] transition-colors">{item.name}</p>
                              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{item.symbol}</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                         <PriceCell value={item.buy} isUp={lastUpdates[item.id]} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`inline-flex items-center gap-1 font-black px-3 py-1.5 rounded-xl text-xs ${item.change24h >= 0 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                          {item.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {Math.abs(item.change24h).toFixed(2)}%
                        </div>
                      </TableCell>
                      <TableCell>
                         <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 bg-neutral-100 dark:bg-white/5 px-3 py-1 rounded-full">
                            {item.category}
                         </span>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <button className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-full hover:bg-[#FF6347] dark:hover:bg-[#FF6347] hover:text-white transition-all">
                          Trade
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          )}
          <MarketEducation type="stocks" />
          <div className="mt-8 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-neutral-900 dark:text-neutral-400">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  NYSE/NASDAQ Status: Real-time Simulation Active
               </div>
               <div className="italic opacity-50">MasterSync High-Fidelity Market Engine</div>
            </div>
        </div>
        
      </main>
      <Footer />
    </div>
  );
}
