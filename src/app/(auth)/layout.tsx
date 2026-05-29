"use client";

import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black transition-colors duration-500 overflow-hidden relative">
      {/* Background Ambience (Matching Hero) */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none z-0" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#33525c]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#33525c]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header removed to move logo into forms */}

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest whitespace-nowrap">
                © 2026 FalconVest. Institutional Trading Platform.
              </span>
            </div>
            <div className="flex items-center gap-8">
              {['Terms', 'Privacy', 'Support'].map((item) => (
                <Link
                  key={item}
                  href={item === 'Support' ? "mailto:support@falconvest.live" : `/${item.toLowerCase()}`}
                  className="text-[10px] font-black text-neutral-400 hover:text-[#33525c] transition-colors uppercase tracking-widest"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
