"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { LogOut, X } from "lucide-react";
import Image from "next/image";

export function MobileNav({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const pathname = usePathname();

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={cn(
                    "fixed z-50 inset-y-0 left-0 w-72 sm:w-80 bg-background border-r transition-transform duration-300 lg:hidden flex flex-col",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex items-center justify-between h-14 px-4 border-b">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center">
                            <Image src="/images/logo.png" alt="Logo" width={24} height={24} />
                        </div>
                        <span className="font-bold">MasterSync</span>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-accent rounded-md">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
                    {[
                        { href: "/dashboard", label: "Overview" },
                        { href: "/dashboard/deposit", label: "Funding" },
                        { href: "/dashboard/copy-trading", label: "Copy Trading" },


                        { href: "/dashboard/withdrawal", label: "Withdrawal" },
                        { href: "/dashboard/trading", label: "Trading" },
                        { href: "/dashboard/holdings", label: "Holdings" },
                        { href: "/dashboard/staking", label: "Staking" },
                        { href: "/dashboard/account", label: "Account" },

                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "block rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-500"
                                    : "hover:bg-accent"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="border-t p-4">
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}
