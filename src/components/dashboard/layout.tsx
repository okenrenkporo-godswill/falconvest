"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/dashboard/account", label: "Account", icon: "👤" },
  { href: "/dashboard/deposit", label: "Deposit", icon: "💰" },
  { href: "/dashboard/withdrawal", label: "Withdrawal", icon: "💸" },
  { href: "/dashboard/trading", label: "Trading", icon: "📈" },
  { href: "/dashboard/holdings", label: "Holdings", icon: "💼" },
  { href: "/dashboard/staking", label: "Staking", icon: "🔒" },
  { href: "/dashboard/copy-trading", label: "Copy Trading", icon: "👥" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">MasterSync</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.href}
            as={Link}
            href={item.href}
            variant={pathname === item.href ? "flat" : "light"}
            className="w-full justify-start"
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t">
        <form action={logoutAction}>
          <Button type="submit" variant="light" className="w-full" color="danger">
            Logout
          </Button>
        </form>
      </div>
    </aside>
  );
}

export function DashboardTopbar() {
  return (
    <header className="border-b p-4 flex justify-between items-center">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button isIconOnly variant="light">
          🔔
        </Button>
      </div>
    </header>
  );
}
