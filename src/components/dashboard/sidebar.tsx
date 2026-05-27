"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogOut, ChevronLeft } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import Image from "next/image";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  navItems: NavItem[];
}

export function Sidebar({ collapsed, onToggle, navItems }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden lg:flex h-screen flex-col border-r border-divider bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center border-b border-divider px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center">
              <Image src="/images/logo1.png" alt="Logo" width={24} height={24} />
            </div>
            <span className="font-semibold">FalconVest</span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex h-7 w-7 items-center justify-center">
            <Image src="/images/logo1.png" alt="Logo" width={24} height={24} />
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
        <div className="flex justify-center border-b border-divider p-2">
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
                    ? "bg-[#01C1D6]/10 text-[#01C1D6] dark:bg-[#01C1D6]/20 dark:text-[#01C1D6]"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  collapsed && "justify-center",
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
      <div className="border-t border-divider p-2">
        <form action={logoutAction}>
          <button
            type="submit"
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10",
              collapsed && "justify-center",
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
