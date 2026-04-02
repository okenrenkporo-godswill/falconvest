"use client";

import Image from "next/image";

export function LogoLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-4">
            <div className="relative w-20 h-20 animate-pulse">
                <Image
                    src="/images/logo1.png"
                    alt="Loading..."
                    fill
                    className="object-contain"
                />
            </div>
            {/* Optional: Add a text if needed, but user just asked for logo */}
        </div>
    );
}
