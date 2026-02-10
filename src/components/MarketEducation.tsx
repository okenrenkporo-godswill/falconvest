"use client";

import React from "react";
import { motion } from "framer-motion";
import { Info, BarChart3, Zap, Clock } from "lucide-react";

interface MarketEducationProps {
  type: "forex" | "stocks" | "crypto";
}

export default function MarketEducation({ type }: MarketEducationProps) {
  const introData = {
    forex: {
      title: "What is Forex?",
      content: "Forex is short for foreign exchange. The forex market is a place where currencies are traded. It is the largest and most liquid financial market in the world with an average daily turnover of 6.6 trillion U.S. dollars as of 2019. The basis of the forex market is the fluctuations of exchange rates. Forex traders speculate on the price fluctuations of currency pairs, making money on the difference between buying and selling prices."
    },
    stocks: {
      title: "What is the Stock Market?",
      content: "The stock market is a public marketplace where you can buy and sell shares of publicly traded companies. It provides companies with access to capital and investors with a slice of ownership and potential profits. The stock market is often used as a key indicator of a country's economic health, reflecting the collective value of its most prominent enterprises."
    },
    crypto: {
      title: "What is Cryptocurrency?",
      content: "Cryptocurrency is a digital or virtual form of currency that uses cryptography for security. The crypto market operates on a decentralized network of computers called a blockchain. Unlike traditional fiat currencies, cryptocurrencies are not controlled by any central authority, allowing for peer-to-peer transactions across a borderless, transparent ledger."
    }
  };

  const hourText = type === "crypto" 
    ? "The cryptocurrency market is unique because it never closes. It is open 24 hours a day, 7 days a week, 365 days a year. This constant availability allows traders to react to news and global events in real-time, regardless of their time zone or the day of the week."
    : "Due to different time zones, the international forex market is open 24 hours a day — from 5 p.m. Eastern Standard Time (EST) on Sunday to 4 p.m. EST on Friday, except holidays. Markets first open in Australasia, then in Europe and afterwards in North America. So, when the market closes in Australia, traders can have access to markets in other regions.";

  return (
    <section className="py-24 bg-white dark:bg-black transition-colors duration-500">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Left Column: Intro & Open Hours */}
          <div className="space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#FF6347]/10 text-[#FF6347]">
                  <Info size={24} />
                </div>
                <h2 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter">
                  {introData[type].title}
                </h2>
              </div>
              <p className="text-lg text-black dark:text-neutral-400 leading-relaxed font-medium">
                {introData[type].content}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#FF6347]/10 text-[#FF6347]">
                  <Clock size={24} />
                </div>
                <h2 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter">
                  When is the market open?
                </h2>
              </div>
              <p className="text-lg text-black dark:text-neutral-400 leading-relaxed font-medium">
                {hourText}
                {type !== "crypto" && " The 24-hour availability of the forex market is what makes it so attractive to millions of traders."}
              </p>
            </motion.div>
          </div>

          {/* Right Column: Margin & Leverage */}
          <div className="space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#FF6347]/10 text-[#FF6347]">
                  <BarChart3 size={24} />
                </div>
                <h2 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter">
                  What is Margin?
                </h2>
              </div>
              <p className="text-lg text-black dark:text-neutral-400 leading-relaxed font-medium">
                Margin is the amount of a trader’s funds required to open a new position. Margin is estimated based on the size of your trade, which is measured in lots. A standard lot is 100,000 units. We also provide mini lots (10,000 units), micro lots (1,000 units) and nano lots (100 units). The greater the lot, the bigger the margin amount. Margin allows you to trade with leverage, which, in turn, allows you to place trades larger than the amount of your trading capital. Leverage influences the margin amount too.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#FF6347]/10 text-[#FF6347]">
                  <Zap size={24} />
                </div>
                <h2 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter">
                  What is leverage?
                </h2>
              </div>
              <p className="text-lg text-black dark:text-neutral-400 leading-relaxed font-medium">
                Leverage is the ability to trade positions larger than the amount of capital you possess. This mechanism allows traders to use extra funds from a broker in order to increase the size of their trades. For example, 1:100 leverage means that a trader who has deposited $1,000 into his or her account can trade with $100,000. Although leverage lets traders increase their trade size and, consequently, potential gains, it magnifies their potential losses putting their capital at risk.
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
