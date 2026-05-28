"use client";

import React from "react";
import PromoVideo from "@/components/PromoVideo";
import { Button } from "@heroui/react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function PromoPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col lg:flex-row items-center justify-center p-6 relative overflow-hidden">
        
        {/* Background Ambience / Noise */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#33525c]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
        </div>

        {/* Left Content: Copy & CTA */}
        <div className="relative z-10 flex-1 max-w-2xl flex flex-col items-center lg:items-start text-center lg:text-left mb-12 lg:mb-0 lg:pr-12">
            
            <motion.div className="h-10"></motion.div> {/* Spacer instead of Logo */}

            <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-5xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-neutral-200 to-neutral-500 mb-6 leading-tight"
            >
                Elevate Your <br /> <span className="text-[#33525c]">Trading Game.</span>
            </motion.h2>

            <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="text-lg text-neutral-400 mb-8 max-w-lg leading-relaxed"
            >
                Stop trading alone. Join an elite community where precision meets performance. 
                Leverage real-time insights, copy the masters, and sync your way to consistent wins.
                <br/><br/>
                <span className="text-white font-medium italic">"Simplicity is the ultimate sophistication."</span>
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
                <Button 
                    as={Link} 
                    href="/register" 
                    size="lg"
                    className="bg-[#33525c] hover:bg-[#2a4550] text-white font-bold px-10 py-6 rounded-full shadow-lg shadow-[#33525c]/40 hover:shadow-xl hover:shadow-[#33525c]/60 transition-all transform hover:-translate-y-1 text-lg"
                >
                    Get Started Now
                </Button>
                
                <Button 
                    as={Link} 
                    href="/login" 
                    variant="bordered" 
                    size="lg"
                    className="border-white/20 text-white hover:bg-white/10 font-medium px-10 py-6 rounded-full transition-all text-lg"
                >
                    Sign In
                </Button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="mt-8 flex items-center gap-2 text-sm text-neutral-500"
            >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <p>Live signals active now</p>
            </motion.div>

        </div>

        {/* Right Content: Phone Component */}
        <motion.div 
             initial={{ opacity: 0, x: 50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
             className="relative z-10 flex-shrink-0"
        >
             {/* Glow behind phone */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-b from-[#33525c]/20 to-transparent rounded-full blur-3xl -z-10"></div>
            <PromoVideo />
        </motion.div>

    </div>
  );
}
