"use client";

import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Header } from "./header";
import { Alert, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, RadioGroup, Radio, addToast } from "@heroui/react";
import { ShieldAlert, Bot } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { payVpsRenewal } from "@/actions/vps";
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
  const [botEnabled, setBotEnabled] = useState(false);
  const [vpsStatus, setVpsStatus] = useState("none");
  const [vpsRenewalPrice, setVpsRenewalPrice] = useState(0);
  const [isVpsModalOpen, setIsVpsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<"USDT" | "BTC">("USDT");
  const [isPayingVps, setIsPayingVps] = useState(false);

  useEffect(() => {
    checkKycStatus();
  }, []);

  const checkKycStatus = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("kyc_status, bot_enabled, vps_status, vps_renewal_price")
        .eq("id", user.id)
        .single();

      const status = profile?.kyc_status || "pending";
      setKycStatus(status);
      setBotEnabled(profile?.bot_enabled || false);
      setVpsStatus(profile?.vps_status || "none");
      setVpsRenewalPrice(Number(profile?.vps_renewal_price) || 0);
      
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

  const dynamicNavItems = useMemo(() => {
    const items = [...navItems];
    if (botEnabled) {
      const myCopyTradesIndex = items.findIndex(item => item.href === "/dashboard/my-copy-trades");
      if (myCopyTradesIndex !== -1) {
        items.splice(myCopyTradesIndex + 1, 0, {
          href: "/dashboard/trading-bot",
          label: "Trading Bot",
          icon: Bot,
        });
      } else {
        items.push({
          href: "/dashboard/trading-bot",
          label: "Trading Bot",
          icon: Bot,
        });
      }
    }
    return items;
  }, [botEnabled]);

  const handlePayVps = async () => {
    setIsPayingVps(true);
    try {
      const result = await payVpsRenewal(selectedAsset);
      if (result.error) {
        addToast({ title: "Payment Failed", description: result.error, color: "danger" });
      } else {
        addToast({ title: "Success", description: "VPS Bot activated successfully", color: "success" });
        setIsVpsModalOpen(false);
        checkKycStatus();
      }
    } catch {
      addToast({ title: "Error", description: "Something went wrong", color: "danger" });
    } finally {
      setIsPayingVps(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        navItems={dynamicNavItems}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      {/* Mobile Sidebar */}
      <MobileNav
        navItems={dynamicNavItems}
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

        {/* VPS Expiration Alert Banner */}
        {vpsStatus === "expired" && (
          <div className="px-4 pt-4">
            <Alert
              color="warning"
              variant="flat"
              startContent={<ShieldAlert size={20} />}
              endContent={
                <Button
                  size="sm"
                  color="warning"
                  variant="solid"
                  className="font-bold bg-[#33525c] text-white hover:bg-[#2a4550]"
                  onPress={() => setIsVpsModalOpen(true)}
                >
                  Pay ${vpsRenewalPrice.toLocaleString()} to Activate
                </Button>
              }
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm">
                  VPS Bot Subscription Expired
                </span>
                <span className="text-xs">
                  Your VPS bot subscription quota has expired. Click the button to pay the subscription fee of ${vpsRenewalPrice.toLocaleString()} and resume bot activity.
                </span>
              </div>
            </Alert>
          </div>
        )}
        
        <main className="flex-1 relative overflow-y-auto p-4">{children}</main>
      </div>

      {/* VPS Activation Modal */}
      <Modal isOpen={isVpsModalOpen} onOpenChange={setIsVpsModalOpen} size="md" backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="font-bold text-xl">Activate VPS Bot</ModalHeader>
              <ModalBody className="space-y-4">
                <p className="text-sm text-default-500">
                  Please select your preferred payment method to renew your VPS subscription. The amount of <strong>${vpsRenewalPrice.toLocaleString()}</strong> will be debited from your selected trading account balance.
                </p>
                <RadioGroup
                  label="Select Asset"
                  value={selectedAsset}
                  onValueChange={(val: any) => setSelectedAsset(val)}
                >
                  <Radio value="USDT">USDT Balance</Radio>
                  <Radio value="BTC">BTC Balance (auto-converted to USD value)</Radio>
                </RadioGroup>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancel</Button>
                <Button
                  color="primary"
                  className="bg-[#33525c] text-white font-bold"
                  onPress={handlePayVps}
                  isLoading={isPayingVps}
                >
                  Pay & Activate
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
