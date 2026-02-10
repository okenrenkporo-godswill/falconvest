"use client";

import React from "react";

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
      <div className="relative w-[320px] h-[650px] bg-black rounded-[50px] shadow-2xl overflow-hidden mx-auto transition-all duration-500 ease-in-out">
        
        {/* Pro Border Structure (Titanium/Metallic Effect) */}
        <div className="absolute inset-0 rounded-[50px] border-[6px] border-[#3a3a3a] z-50 pointer-events-none shadow-[inset_0_0_4px_rgba(255,255,255,0.2)]"></div>
        <div className="absolute inset-0 rounded-[50px] border-[1px] border-white/20 z-50 pointer-events-none"></div>
        
        {/* Left Side Buttons (Volume/Power) */}
        <div className="absolute top-24 left-[-8px] w-[6px] h-10 bg-[#2a2a2a] rounded-l-md shadow-md"></div>
        <div className="absolute top-40 left-[-8px] w-[6px] h-16 bg-[#2a2a2a] rounded-l-md shadow-md"></div>
        <div className="absolute top-32 right-[-8px] w-[6px] h-24 bg-[#2a2a2a] rounded-r-md shadow-md"></div>

        {/* Dynamic Island / Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-[60] flex items-center justify-center pointer-events-none">
            <div className="w-2/3 h-2/3 flex items-center justify-between px-1">
                 <div className="w-2 h-2 rounded-full bg-[#1a1a1a]/50"></div>
            </div>
        </div>

        {/* Screen Content */}
        <div className="w-full h-full bg-black relative flex flex-col items-center justify-center p-6 text-center overflow-hidden rounded-[44px]">
            {children}
        </div>
      </div>
  );
}
