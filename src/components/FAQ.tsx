"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";

const FAQItem = ({ item, isExpanded, onToggle }: { item: { question: string; answer: string }; isExpanded: boolean; onToggle: () => void }) => {
  return (
    <div 
      className={`group border-b border-white/5 transition-all duration-500 ${isExpanded ? "bg-white/[0.02]" : "hover:bg-white/[0.01]"}`}
    >
      <button
        onClick={onToggle}
        className="w-full py-8 px-6 flex items-center justify-between text-left gap-4"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg transition-colors duration-300 ${isExpanded ? "bg-[#01C1D6] text-white" : "bg-neutral-100 dark:bg-neutral-900 text-neutral-500 group-hover:text-black dark:group-hover:text-white"}`}>
            <HelpCircle size={20} />
          </div>
          <span className={`text-lg md:text-xl font-medium tracking-tight transition-colors duration-300 ${isExpanded ? "text-white dark:text-white" : "text-neutral-900 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-neutral-200"}`}>
            {item.question}
          </span>
        </div>
        <div className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ${isExpanded ? "bg-[#01C1D6] border-[#01C1D6] text-white rotate-180" : "border-white/10 text-neutral-500 group-hover:border-white/20"}`}>
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
              <p className="text-neutral-600 dark:text-neutral-500 text-lg leading-relaxed max-w-3xl whitespace-pre-line border-l-2 border-[#01C1D6]/20 pl-6">
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
  const t = useTranslations("FAQ");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqData = [
    {
      question: t('questions.0.question'),
      answer: t('questions.0.answer')
    },
    {
      question: t('questions.1.question'),
      answer: t('questions.1.answer')
    },
    {
      question: t('questions.2.question'),
      answer: t('questions.2.answer')
    },
    {
      question: t('questions.3.question'),
      answer: t('questions.3.answer')
    },
    {
      question: t('questions.4.question'),
      answer: t('questions.4.answer')
    },
    {
      question: t('questions.5.question'),
      answer: t('questions.5.answer')
    }
  ];

  return (
    <section className="relative w-full py-32 px-4 bg-transparent overflow-hidden transition-colors duration-500">
      {/* Background radial effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#01C1D6]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-20 space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-black dark:text-white tracking-tighter uppercase"
          >
            {t('headline.prefix')} <span className="text-[#01C1D6]">{t('headline.suffix')}</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-neutral-600 dark:text-neutral-400 text-lg"
          >
            {t('description')}
          </motion.p>
        </div>

        <div className="border-t border-white/5 rounded-3xl overflow-hidden bg-white/[0.01] backdrop-blur-sm border-x border-b border-white/5">
          {faqData.map((item, index) => (
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
            {t('contact.text')} <Link href="/contact" className="text-[#01C1D6] cursor-pointer hover:underline">{t('contact.link')}</Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
