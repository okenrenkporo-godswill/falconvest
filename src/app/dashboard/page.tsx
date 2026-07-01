import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountTabs } from "@/components/dashboard/account-tabs";
import { BotRestrictionModal } from "@/components/dashboard/bot-restriction-modal";

import { ArrowDownCircle, ArrowUpCircle, Users2, Pickaxe } from "lucide-react";
import { MobileBannerBoxes } from "@/components/dashboard/market-ticker";

import { getCryptoPrices } from "@/lib/crypto-prices";

export const revalidate = 30; // Cache for 30 seconds

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
    .select("full_name, profit_amount, bot_restriction_active")
    .eq("id", user.id)
    .single();

  // Get balances
  const { data: balances } = await supabase
    .from("balances")
    .select("*")
    .eq("user_id", user.id);

  // 1. Get all copy trades to calculate "Locked" funds and copy trading profits
  const { data: allCopyTrades } = await supabase
    .from("copy_trades")
    .select("copy_amount, total_profit, asset, status")
    .eq("user_id", user.id);

  const activeCopyTrades = allCopyTrades?.filter((ct) => ct.status === "active") || [];
  const activeCopyAssets = activeCopyTrades.map(ct => ct.asset || "USDT");

  // Get wallet logos from platform_wallets using admin client (bypass RLS)
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const { getAssetLogo } = await import("@/lib/assets");
  const adminClient = createAdminClient();
  const { data: wallets } = await adminClient
    .from("platform_wallets")
    .select("symbol, logo_url");

  // 2. Get current crypto prices
  const uniqueAssets = [...new Set([
    ...(balances?.map((b) => b.asset) || []),
    ...(allCopyTrades?.map((ct) => ct.asset || "USDT") || [])
  ])];
  const prices = await getCryptoPrices(uniqueAssets);

  // Convert active copy trade funds to USD
  const lockedCopyFunds = activeCopyTrades.reduce((sum, ct) => {
    const price = prices[ct.asset || "USDT"] || (["USDT", "USDC"].includes(ct.asset || "USDT") ? 1 : 0);
    return sum + (Number(ct.copy_amount) * price);
  }, 0);

  // Convert all copy trading profits to USD
  const copyTradingProfitsUSD = allCopyTrades?.reduce((sum, ct) => {
    const price = prices[ct.asset || "USDT"] || (["USDT", "USDC"].includes(ct.asset || "USDT") ? 1 : 0);
    return sum + (Number(ct.total_profit) * price);
  }, 0) || 0;

  // 3. Map logos and calculate USD value for balances
  const balancesWithLogos = balances?.map((balance) => {
    const price = prices[balance.asset] || (["USDT", "USDC"].includes(balance.asset) ? 1 : 0);
    const usdValue = Number(balance.amount) * price;

    return {
      ...balance,
      logo_url: wallets?.find((w) => w.symbol === balance.asset.toUpperCase())?.logo_url || getAssetLogo(balance.asset),
      usd_value: usdValue,
      current_price: price
    };
  });

  // 4. Calculate final totals including LOCKED funds
  // Total Balance = All liquid assets + All funds in copy trades
  const liquidTotal = balancesWithLogos?.reduce((sum, b) => sum + b.usd_value, 0) || 0;
  const totalBalance = liquidTotal + lockedCopyFunds;

  // Trading Balance = Liquid USDT in trading account + Funds in active copy trades
  const liquidTrading = balancesWithLogos
      ?.filter((b) => b.account_type === "trading")
      .reduce((sum, b) => sum + b.usd_value, 0) || 0;
  const tradingBalance = liquidTrading + lockedCopyFunds;

  const holdingsBalance =
    balancesWithLogos
      ?.filter((b) => b.account_type === "holdings")
      .reduce((sum, b) => sum + b.usd_value, 0) || 0;
  const stakingBalance =
    balancesWithLogos
      ?.filter((b) => b.account_type === "staking")
      .reduce((sum, b) => sum + b.usd_value, 0) || 0;

  // Get recent deposits and withdrawals
  const { data: recentDeposits } = await supabase
    .from("deposits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentWithdrawals } = await supabase
    .from("withdrawals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Calculate sum of all user's deposits (pending and completed)
  const { data: allDeposits } = await supabase
    .from("deposits")
    .select("usd_value")
    .eq("user_id", user.id);

  const amountDeposited = allDeposits?.reduce((sum, d) => sum + Number(d.usd_value), 0) || 0;
  const profitAmount = Number(profile?.profit_amount) || 0;
  const totalProfitAmount = profitAmount + copyTradingProfitsUSD;

  // Combine and sort by date
  const recentActivity = [
    ...(recentDeposits || []).map(d => ({ ...d, type: 'deposit' as const })),
    ...(recentWithdrawals || []).map(w => ({ ...w, type: 'withdrawal' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-3 sm:p-4">
      {/* Bot Restriction Modal Alert */}
      <BotRestrictionModal isActive={profile?.bot_restriction_active || false} />

      {/* Metrics Card */}
      <Card className="bg-transparent shadow-none border-none" shadow="none">
        <CardBody className="px-0 py-2 flex flex-col gap-4">
          <div>
            <p className="text-xs text-default-500 uppercase tracking-wider font-bold mb-1">Total Assets</p>
            <h2 className="text-3xl font-extrabold">${totalBalance.toFixed(2)}</h2>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs">
              <span className="text-default-400">
                Deposited: <span className="text-[#00b887] font-semibold">${amountDeposited.toFixed(2)}</span>
              </span>
              <span className="text-default-400">
                Profits: <span className={`${totalProfitAmount >= 0 ? "text-[#00b887]" : "text-danger"} font-semibold`}>
                  {totalProfitAmount >= 0 ? "+" : "-"}${Math.abs(totalProfitAmount).toFixed(2)}
                </span>
              </span>
            </div>
          </div>

          <div className="border-l border-default-300 dark:border-default-700 pl-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-default-400">
            <span>Trading: <strong className="text-foreground dark:text-white">${tradingBalance.toFixed(2)}</strong></span>
            <span>Holdings: <strong className="text-foreground dark:text-white">${holdingsBalance.toFixed(2)}</strong></span>
            <span>Staked: <strong className="text-foreground dark:text-white">${stakingBalance.toFixed(2)}</strong></span>
          </div>
        </CardBody>
      </Card>

      {/* Overview header and actions */}
      <div className="flex flex-col gap-4">
        {/* Desktop and mobile actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         

          {/* Desktop Action Buttons - horizontal row on right */}
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/dashboard/deposit" passHref>
              <Button
                size="sm"
                className="bg-[#33525c] text-white hover:bg-[#2a4550] font-medium"
                startContent={<ArrowDownCircle className="w-4 h-4" />}
              >
                Deposit
              </Button>
            </Link>
            <Link href="/dashboard/withdrawal" passHref>
              <Button
                size="sm"
                variant="bordered"
                className="border-default-300"
                startContent={<ArrowUpCircle className="w-4 h-4" />}
              >
                Withdraw
              </Button>
            </Link>
            <Link href="/dashboard/copy-trading" passHref>
              <Button
                size="sm"
                variant="bordered"
                className="border-default-300"
                startContent={<Users2 className="w-4 h-4" />}
              >
                Copy Trading
              </Button>
            </Link>

            <Link href="/dashboard/staking" passHref>
              <Button
                size="sm"
                variant="bordered"
                className="border-default-300"
                startContent={<Pickaxe className="w-4 h-4" />}
              >
                Staking
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Action Buttons - circular icons with labels below */}
        <div className="grid grid-cols-4 gap-2 sm:hidden">
          {/* Deposit */}
          <div className="flex flex-col items-center gap-1.5">
            <Link
              href="/dashboard/deposit"
              className="w-12 h-12 rounded-full bg-[#33525c] hover:bg-[#2a4550] transition-colors flex items-center justify-center"
            >
              <ArrowDownCircle className="w-5 h-5 text-white" />
            </Link>
            <span className="text-[10px] font-medium text-default-700">
              Deposit
            </span>
          </div>

          {/* Withdraw - Light Grey background, default icon */}
          <div className="flex flex-col items-center gap-1.5">
            <Link
              href="/dashboard/withdrawal"
              className="w-12 h-12 rounded-full bg-default-100 hover:bg-default-200 transition-colors flex items-center justify-center"
            >
              <ArrowUpCircle className="w-5 h-5 text-default-700" />
            </Link>
            <span className="text-[10px] font-medium text-default-700">
              Withdraw
            </span>
          </div>

          {/* My Trader - Light Grey background, default icon */}
          <div className="flex flex-col items-center gap-1.5">
            <Link
              href="/dashboard/copy-trading"
              className="w-12 h-12 rounded-full bg-default-100 hover:bg-default-200 transition-colors flex items-center justify-center"
            >
              <Users2 className="w-5 h-5 text-default-700" />
            </Link>
            <span className="text-[10px] font-medium text-default-700">
              Copy Trading
            </span>
          </div>

          {/* Staking - Light Grey background, default icon */}
          <div className="flex flex-col items-center gap-1.5">
            <Link
              href="/dashboard/staking"
              className="w-12 h-12 rounded-full bg-default-100 hover:bg-default-200 transition-colors flex items-center justify-center"
            >
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
            <span className="text-[10px] font-medium text-default-700">
              Staking
            </span>
          </div>
        </div>
      </div>

      {/* Market Ticker - Sliding cards with charts (Mobile only background) */}
      {/* <MarketTicker /> */}
      <MobileBannerBoxes />

      <AccountTabs
        totalBalance={totalBalance}
        lockedBalance={lockedCopyFunds}
        balances={balancesWithLogos || []}
      />

      {/* Recent Activity */}
      <Card className="bg-transparent shadow-none border-none" shadow="none">
        <CardHeader className="pb-3 px-0">
          <h3 className="text-xs sm:text-sm font-semibold">
            Recent Deposit & Withdrawal History
          </h3>
        </CardHeader>
        <CardBody>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-default-400">
              <p className="text-xs sm:text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-50/5 border border-default-100 dark:border-default-50/10"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${activity.type === "deposit"
                          ? "bg-success/10"
                          : "bg-warning/10"
                        }`}
                    >
                      {activity.type === "deposit" ? (
                        <ArrowDownCircle className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowUpCircle className="w-4 h-4 text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold capitalize">
                        {activity.type}
                      </p>
                      <p className="text-xs text-default-500">
                        {new Date(activity.created_at).toLocaleDateString()} •{" "}
                        {activity.asset}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {activity.type === "deposit" ? "+" : "-"}
                      {activity.amount} {activity.asset}
                    </p>
                    <p className="text-xs">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${activity.status === "completed"
                            ? "bg-success/10 text-success"
                            : activity.status === "pending"
                              ? "bg-warning/10 text-warning"
                              : "bg-danger/10 text-danger"
                          }`}
                      >
                        {activity.status}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
