"use client";

import Image from "next/image";

export function LogoLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-4">
            <div className="relative w-20 h-20 flex items-center justify-center animate-pulse">
                {/* Glowing background bubble */}
                <div className="absolute inset-0 bg-[#7eb2bd]/20 dark:bg-[#33525c]/20 blur-md rounded-full scale-110" />
                
                {/* Futuristic Emblem */}
                <svg viewBox="0 0 100 100" className="w-14 h-14 relative z-10 drop-shadow-[0_2px_8px_rgba(51,82,92,0.3)] animate-spin" style={{ animationDuration: '3s' }}>
                    <path 
                        d="M 50 10 L 85 45 L 70 50 L 50 25 L 30 50 L 15 45 Z" 
                        fill="url(#loader-logo-grad-1)" 
                    />
                    <path 
                        d="M 50 30 L 90 70 L 65 75 L 50 55 L 35 75 L 10 70 Z" 
                        fill="url(#loader-logo-grad-2)" 
                    />
                    <defs>
                        <linearGradient id="loader-logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#7eb2bd" />
                            <stop offset="100%" stopColor="#33525c" />
                        </linearGradient>
                        <linearGradient id="loader-logo-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a9ccd3" />
                            <stop offset="100%" stopColor="#5399a7" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
}

export function FalconLogo({ className = "w-7 h-7" }: { className?: string }) {
    return (
        <div className="relative flex items-center justify-center shrink-0">
            {/* Glowing background bubble */}
            <div className="absolute inset-0 bg-[#7eb2bd]/20 dark:bg-[#33525c]/20 blur-md rounded-full scale-110" />
            
            {/* Futuristic Emblem */}
            <svg viewBox="0 0 100 100" className={`${className} relative z-10 drop-shadow-[0_2px_8px_rgba(51,82,92,0.3)]`}>
                <path 
                    d="M 50 10 L 85 45 L 70 50 L 50 25 L 30 50 L 15 45 Z" 
                    fill="url(#falcon-logo-grad-1)" 
                />
                <path 
                    d="M 50 30 L 90 70 L 65 75 L 50 55 L 35 75 L 10 70 Z" 
                    fill="url(#falcon-logo-grad-2)" 
                />
                <defs>
                    <linearGradient id="falcon-logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7eb2bd" />
                        <stop offset="100%" stopColor="#33525c" />
                    </linearGradient>
                    <linearGradient id="falcon-logo-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a9ccd3" />
                        <stop offset="100%" stopColor="#5399a7" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

