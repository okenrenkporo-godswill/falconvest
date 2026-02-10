"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, Minus, HelpCircle } from "lucide-react";

const FAQ_DATA = [
  {
    question: "How to start trading with MasterSync?",
    answer: "Starting your journey is simple: \n1. Create your secure MasterSync account.\n2. Complete our streamlined identity verification (KYC).\n3. Fund your account via your preferred digital wallet or bank transfer.\n4. Launch the dashboard and start executing trades instantly."
  },
  {
    question: "How to create an account and confirm your email address?",
    answer: "Visit the registration page, enter your details, and set a strong password. You'll receive a unique verification code in your inbox—simply enter this on the platform to activate your account and secure your profile."
  },
  {
    question: "Confirm your identification and eligibility for trading?",
    answer: "As a regulated platform, we require a valid government-issued ID and proof of address. Our AI-driven verification system usually clears accounts within minutes, ensuring you meet global financial eligibility standards."
  },
  {
    question: "How do I deposit money and fund my account?",
    answer: "MasterSync supports a wide range of funding methods. Navigate to the 'Funding' section in your dashboard to choose between instant crypto transfers, credit/debit cards, or traditional wire transfers. All funds are held in segregated, institutional-grade accounts."
  },
  {
    question: "Is MasterSync a regulated broker?",
    answer: "Yes, MasterSync operates under strict regulatory frameworks to provide a secure and transparent trading environment. We maintain high capital requirements and undergo regular independent audits to ensure client protection."
  },
  {
    question: "How to withdraw money from MasterSync?",
    answer: "Withdrawals are processed swiftly. Simply go to 'My Wallet', select 'Withdraw', and choose your destination. Most crypto withdrawals are instant, while traditional bank transfers typically complete within 1-2 business days."
  }
];

const FAQItem = ({ item, isExpanded, onToggle }: { item: typeof FAQ_DATA[0]; isExpanded: boolean; onToggle: () => void }) => {
  return (
    <div 
      className={`group border-b border-white/5 transition-all duration-500 ${isExpanded ? "bg-white/[0.02]" : "hover:bg-white/[0.01]"}`}
    >
      <button
        onClick={onToggle}
        className="w-full py-8 px-6 flex items-center justify-between text-left gap-4"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg transition-colors duration-300 ${isExpanded ? "bg-[#FF6347] text-white" : "bg-neutral-100 dark:bg-neutral-900 text-neutral-500 group-hover:text-black dark:group-hover:text-white"}`}>
            <HelpCircle size={20} />
          </div>
          <span className={`text-lg md:text-xl font-medium tracking-tight transition-colors duration-300 ${isExpanded ? "text-white dark:text-white" : "text-neutral-900 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-neutral-200"}`}>
            {item.question}
          </span>
        </div>
        <div className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ${isExpanded ? "bg-[#FF6347] border-[#FF6347] text-white rotate-180" : "border-white/10 text-neutral-500 group-hover:border-white/20"}`}>
          {isExpanded ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-8 ml-14">
              <p className="text-neutral-600 dark:text-neutral-500 text-lg leading-relaxed max-w-3xl whitespace-pre-line border-l-2 border-[#FF6347]/20 pl-6">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <section className="relative w-full py-32 px-4 bg-transparent overflow-hidden transition-colors duration-500">
      {/* Background radial effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF6347]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-20 space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-black dark:text-white tracking-tighter uppercase"
          >
            GOT <span className="text-[#FF6347]">QUESTIONS?</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-neutral-600 dark:text-neutral-400 text-lg"
          >
            Everything you need to know about the MasterSync ecosystem.
          </motion.p>
        </div>

        <div className="border-t border-white/5 rounded-3xl overflow-hidden bg-white/[0.01] backdrop-blur-sm border-x border-b border-white/5">
          {FAQ_DATA.map((item, index) => (
            <FAQItem 
              key={index} 
              item={item} 
              isExpanded={expandedIndex === index}
              onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
            />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-neutral-900 dark:text-neutral-500 font-medium">
            Still have questions? <Link href="/contact" className="text-[#FF6347] cursor-pointer hover:underline">Contact our 24/7 support team.</Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
