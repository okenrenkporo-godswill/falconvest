"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/react";
import Link from "next/link";
import Image from "next/image";

const slides = [
  {
    id: 1,
    title: "Master the Market",
    subtitle: "Trade with precision using institutional-grade tools designed for the modern trader.",
    src: "/images/trading.mp4",
    cta: "Start Trading",
    ctaLink: "/register",
  },
  {
    id: 2,
    title: "Visualize Your Success",
    subtitle: "Experience superior clarity with our advanced TradingView integration. Chart your path to profit.",
    src: "/images/view.mp4",
    cta: "Explore Charts",
    ctaLink: "/markets",
  },
  {
    id: 3,
    title: "Secure Your Future",
    subtitle: "Trade with unwavering confidence. Bank-level security and negative balance protection keep you safe.",
    src: "/images/third.mp4",
    cta: "Learn More",
    ctaLink: "/security",
  }
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000); // 8 seconds per slide

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Video Backgrounds with Zoom Effect */}
      <AnimatePresence mode="popLayout">
        <motion.div
           key={slides[currentSlide].id}
           initial={{ opacity: 0, scale: 1.1 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 1.5, ease: "easeOut" }}
           className="absolute inset-0 w-full h-full"
        >
           <video
             src={slides[currentSlide].src}
             autoPlay
             loop
             muted
             playsInline
             className="absolute inset-0 w-full h-full object-cover opacity-60"
           />
           {/* Overlay Gradient */}
           <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
             key={slides[currentSlide].id}
             initial={{ opacity: 0, x: -50 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: 50 }}
             transition={{ duration: 0.8, ease: "easeOut" }}
             className="max-w-2xl space-y-6"
          >
             {/* Dynamic Badge */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6347]/20 border border-[#FF6347]/30 backdrop-blur-md"
             >
                 <span className="w-2 h-2 rounded-full bg-[#FF6347] animate-pulse"></span>
                 <span className="text-white text-xs font-bold uppercase tracking-wider">MasterSync Pro</span>
             </motion.div>

             {/* Headline */}
             <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight leading-none">
                {slides[currentSlide].title.split(" ").map((word, i) => (
                    <span key={i} className="inline-block mr-4">{word}</span>
                ))}
             </h1>

             {/* Subtitle */}
             <p className="text-xl md:text-2xl text-neutral-300 max-w-xl leading-relaxed">
                 {slides[currentSlide].subtitle}
             </p>

             {/* CTA Buttons */}
             <div className="flex gap-4 pt-4">
                 <Button 
                    as={Link} 
                    href={slides[currentSlide].ctaLink} 
                    size="lg"
                    className="bg-[#FF6347] text-white font-bold px-8 py-6 rounded-full shadow-[0_0_20px_rgba(255,99,71,0.3)] border border-[#FF6347]/50 hover:scale-105 transition-transform"
                 >
                    {slides[currentSlide].cta}
                 </Button>
                 <Button 
                    as={Link} 
                    href="/promo" 
                    variant="bordered"
                    size="lg"
                    className="text-white border-white/20 hover:bg-white/10 font-medium px-8 py-6 rounded-full"
                 >
                    Watch Demo
                 </Button>
             </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Navigation Dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {slides.map((_, index) => (
              <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === index ? 'w-12 bg-white' : 'w-2 bg-white/30 hover:bg-white/60'}`}
              />
          ))}
      </div>
    </section>
  );
}
