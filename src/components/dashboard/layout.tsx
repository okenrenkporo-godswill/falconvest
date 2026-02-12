"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Header } from "./header";
import { Alert } from "@heroui/react";
import { ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Home,
  User,
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  Briefcase,
  Lock,
  Users,
  LogOut,
  ChevronLeft,
  Wallet,
  Copy,
  Target,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/deposit", label: "Funding", icon: ArrowDownCircle },
  { href: "/dashboard/copy-trading", label: "Copy Trading", icon: Users },
  { href: "/dashboard/my-copy-trades", label: "My Copy Trades", icon: Copy },
  { href: "/dashboard/withdrawal", label: "Withdrawal", icon: ArrowUpCircle },
  { href: "/dashboard/trading", label: "Trading", icon: TrendingUp },
  { href: "/dashboard/positions", label: "Positions", icon: Target },
  { href: "/dashboard/holdings", label: "Holdings", icon: Briefcase },
  { href: "/dashboard/staking", label: "Staking", icon: Lock },
  { href: "/dashboard/account/wallets", label: "My Wallets", icon: Wallet },
  { href: "/dashboard/account", label: "Account", icon: User },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showKycAlert, setShowKycAlert] = useState(false);
  const [kycStatus, setKycStatus] = useState<string>("");
  const [hasSubmission, setHasSubmission] = useState(false);

  useEffect(() => {
    checkKycStatus();
  }, []);

  const checkKycStatus = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("kyc_status")
        .eq("id", user.id)
        .single();

      const status = profile?.kyc_status || "pending";
      setKycStatus(status);
      
      // Check if user has actually submitted KYC documents
      const { data: submission } = await supabase
        .from("kyc_submissions")
        .select("id")
        .eq("user_id", user.id)
        .single();
      
      const hasSubmitted = !!submission;
      setHasSubmission(hasSubmitted);
      
      // Show alert only if not verified
      const isVerified = status === "auto_verified" || status === "manually_verified";
      setShowKycAlert(!isVerified);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        navItems={navItems}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      {/* Mobile Sidebar */}
      <MobileNav
        navItems={navItems}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Content */}
      <div className="flex flex-1 flex-col relative">
        <Header onMenu={() => setMobileOpen(true)} />
        
        {/* KYC Alert Banner */}
        {showKycAlert && (
          <div className="px-4 pt-4">
            <Alert
              color="warning"
              variant="flat"
              startContent={<ShieldAlert size={20} />}
              endContent={
                <Link href="/dashboard/account?openKyc=true">
                  <button className="text-xs font-semibold underline hover:no-underline">
                    Verify Now
                  </button>
                </Link>
              }
              onClose={() => setShowKycAlert(false)}
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm">
                  {hasSubmission && kycStatus === "pending" ? "KYC Under Review" : "Complete Identity Verification"}
                </span>
                <span className="text-xs">
                  {hasSubmission && kycStatus === "pending"
                    ? "Your KYC submission is being reviewed. This typically takes 15-30 minutes."
                    : "Verify your identity to unlock full trading features and higher limits."}
                </span>
              </div>
            </Alert>
          </div>
        )}
        
        <main className="flex-1 relative overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
