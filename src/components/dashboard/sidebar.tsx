"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Home, User, ArrowDownCircle, ArrowUpCircle,
    TrendingUp, Briefcase, Lock, Users, LogOut, ChevronLeft
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import Image from "next/image";

const navItems = [
    { href: "/dashboard", label: "Overview", icon: Home },
    { href: "/dashboard/deposit", label: "Funding", icon: ArrowDownCircle },
    { href: "/dashboard/copy-trading", label: "Copy Trading", icon: Users },
    { href: "/dashboard/withdrawal", label: "Withdrawal", icon: ArrowUpCircle },
    { href: "/dashboard/trading", label: "Trading", icon: TrendingUp },
    { href: "/dashboard/holdings", label: "Holdings", icon: Briefcase },
    { href: "/dashboard/staking", label: "Staking", icon: Lock },
    { href: "/dashboard/account", label: "Account", icon: User },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "hidden lg:flex h-screen flex-col border-r bg-background transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Header */}
            <div className="flex h-14 items-center border-b px-4">
                {!collapsed && (
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center">
                            <Image src="/images/logo.png" alt="Logo" width={24} height={24} />
                        </div>
                        <span className="font-semibold">MasterSync</span>
                    </Link>
                )}
                {collapsed && (
                    <div className="mx-auto flex h-7 w-7 items-center justify-center">
                        <Image src="/images/logo.png" alt="Logo" width={24} height={24} />
                    </div>
                )}
                {!collapsed && (
                    <button
                        onClick={onToggle}
                        className="ml-auto flex items-center justify-center rounded-md border p-1.5 hover:bg-accent"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Collapsed toggle button */}
            {collapsed && (
                <div className="flex justify-center border-b p-2">
                    <button
                        onClick={onToggle}
                        className="flex items-center justify-center rounded-md border p-1.5 hover:bg-accent"
                    >
                        <ChevronLeft className="h-4 w-4 rotate-180" />
                    </button>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-2">
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-500"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                    collapsed && "justify-center"
                                )}
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon className="h-4 w-4 flex-shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Logout */}
            <div className="border-t p-2">
                <form action={logoutAction}>
                    <button
                        type="submit"
                        className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10",
                            collapsed && "justify-center"
                        )}
                        title={collapsed ? "Logout" : undefined}
                    >
                        <LogOut className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </form>
            </div>
        </aside>
    );
}
