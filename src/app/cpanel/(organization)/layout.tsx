"use client";

import { useState } from "react";
import { Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, FileCheck, Wallet, ArrowDownToLine, 
  ArrowUpFromLine, TrendingUp, UserCog, Menu, X, LogOut, Settings, Copy, Lock, Briefcase
} from "lucide-react";

const navItems = [
  { href: "/cpanel/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cpanel/users", label: "Users", icon: Users },
  { href: "/cpanel/kyc-pending", label: "KYC Queue", icon: FileCheck },
  { href: "/cpanel/wallets", label: "Wallets", icon: Wallet },
  { href: "/cpanel/deposits", label: "Deposits", icon: ArrowDownToLine },
  { href: "/cpanel/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
  { href: "/cpanel/traders", label: "Traders", icon: UserCog },
  { href: "/cpanel/copy-trades", label: "Copy Trades", icon: Copy },
  { href: "/cpanel/trades", label: "Trades", icon: TrendingUp },
  { href: "/cpanel/staking", label: "Staking", icon: Lock },
  { href: "/cpanel/holdings", label: "Holdings", icon: Briefcase },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/auth/signout", { method: "POST" });
    router.push("/cpanel");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Control Panel</h1>
        <Button
          isIconOnly
          variant="light"
          onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 bg-background border-r z-40
        transition-transform duration-300 lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b hidden lg:block">
            <h1 className="text-2xl font-bold">Control Panel</h1>
            <p className="text-xs text-default-500 mt-1">Admin Dashboard</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-16 lg:mt-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  as={Link}
                  href={item.href}
                  variant={isActive ? "flat" : "light"}
                  className={`w-full justify-start ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
                  startContent={<Icon size={18} />}
                  onPress={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="p-4 border-t">
            <Dropdown placement="top">
              <DropdownTrigger>
                <Button variant="light" className="w-full justify-start">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm" name="Admin" />
                    <div className="text-left">
                      <p className="text-sm font-semibold">Admin User</p>
                      <p className="text-xs text-default-500">admin@mastersync.com</p>
                    </div>
                  </div>
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="settings" startContent={<Settings size={16} />}>
                  Settings
                </DropdownItem>
                <DropdownItem 
                  key="logout" 
                  color="danger" 
                  startContent={<LogOut size={16} />}
                  onPress={handleLogout}
                >
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
