import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountTabs } from "@/components/dashboard/account-tabs";

import { ArrowDownCircle, ArrowUpCircle, Users2, Pickaxe } from "lucide-react";
import { MobileBannerBoxes } from "@/components/dashboard/market-ticker";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Get balances
  const { data: balances } = await supabase
    .from("balances")
    .select("*")
    .eq("user_id", user.id);

  const totalBalance = balances?.reduce((sum, b) => sum + Number(b.amount), 0) || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-4 p-3 sm:p-4">
      {/* Assets Overview Header */}
      <div className="flex flex-col gap-4">
        {/* Balance and buttons container - desktop horizontal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs sm:text-sm text-default-500 mb-1">Assets Overview</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{totalBalance.toFixed(2)}</h1>
              <span className="text-xs sm:text-sm text-default-500">USD</span>
            </div>
            <p className="text-xs text-default-400 mt-0.5">≈ 0.00000000 BTC</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-default-500">Today's P&L:</span>
              <span className="text-xs text-green-600">$0.01 (-1.84%) ↗</span>
            </div>
          </div>

          {/* Desktop Action Buttons - horizontal row on right */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              as={Link}
              href="/dashboard/deposit"
              size="sm"
              className="bg-red-500 text-white hover:bg-red-600 font-medium"
              startContent={<ArrowDownCircle className="w-4 h-4" />}
            >
              Deposit
            </Button>
            <Button
              as={Link}
              href="/dashboard/withdrawal"
              size="sm"
              variant="bordered"
              className="border-default-300"
              startContent={<ArrowUpCircle className="w-4 h-4" />}
            >
              Withdraw
            </Button>
            <Button
              as={Link}
              href="/dashboard/copy-trading"
              size="sm"
              variant="bordered"
              className="border-default-300"
              startContent={<Users2 className="w-4 h-4" />}
            >
              Copy Trading
            </Button>
            <Button
              as={Link}
              href="/dashboard/staking"
              size="sm"
              variant="bordered"
              className="border-default-300"
              startContent={<ArrowUpCircle className="w-4 h-4 rotate-45" />} // Using a different icon or Lock
            >
              Staking
            </Button>
          </div>
        </div>

        {/* Mobile Action Buttons - circular icons with labels below */}
        <div className="grid grid-cols-4 gap-2 sm:hidden">
          {/* Deposit - Red background, white icon */}
          <div className="flex flex-col items-center gap-1.5">
            <Link href="/dashboard/deposit" className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5 text-white" />
            </Link>
            <span className="text-[10px] font-medium text-default-700">Deposit</span>
          </div>

          {/* Withdraw - Light Grey background, default icon */}
          <div className="flex flex-col items-center gap-1.5">
            <Link href="/dashboard/withdrawal" className="w-12 h-12 rounded-full bg-default-100 hover:bg-default-200 transition-colors flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5 text-default-700" />
            </Link>
            <span className="text-[10px] font-medium text-default-700">Withdraw</span>
          </div>

          {/* My Trader - Light Grey background, default icon */}
          <div className="flex flex-col items-center gap-1.5">
            <Link href="/dashboard/copy-trading" className="w-12 h-12 rounded-full bg-default-100 hover:bg-default-200 transition-colors flex items-center justify-center">
              <Users2 className="w-5 h-5 text-default-700" />
            </Link>
            <span className="text-[10px] font-medium text-default-700">Copy Trading</span>
          </div>

          {/* Staking - Light Grey background, default icon */}
          <div className="flex flex-col items-center gap-1.5">
            <Link href="/dashboard/staking" className="w-12 h-12 rounded-full bg-default-100 hover:bg-default-200 transition-colors flex items-center justify-center">
              {/* Using Lock icon to match sidebar */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-default-700"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </Link>
            <span className="text-[10px] font-medium text-default-700">Staking</span>
          </div>
        </div>
      </div>

      {/* Market Ticker - Sliding cards with charts (Mobile only background) */}
      {/* <MarketTicker /> */}
      <MobileBannerBoxes />

      {/* Account/Asset Tabs */}
      <AccountTabs totalBalance={totalBalance} balances={balances} />

      {/* Recent Activity */}
      <Card className="bg-transparent shadow-none border-none" shadow="none">
        <CardHeader className="pb-3 px-0">
          <h3 className="text-xs sm:text-sm font-semibold">Recent Deposit & Withdrawal History</h3>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8 sm:py-12 text-default-400">
            <p className="text-xs sm:text-sm">No recent activity</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
