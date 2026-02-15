"use client";

import { Card, CardBody, Skeleton, Chip, Tabs, Tab, Button, addToast } from "@heroui/react"; // Added addToast
import { useEffect, useState } from "react";
import { getUserDetails } from "@/actions/admin-user-details";
import { adminStopCopyTrade } from "@/actions/admin-copy-trades"; // Use quiet action to prevent reload
import { ArrowLeft, User, Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle, Lock, ShieldCheck, Plus } from "lucide-react"; // Added Plus
import Link from "next/link";
import Image from "next/image";
import { AddCopyTradeResultModal } from "./add-copy-trade-result-modal";
import { UpdateBalanceModal } from "./update-balance-modal"; // Import new modal

import { getCryptoPrices } from "@/lib/crypto-prices"; // Import price fetcher

export function UserDetailsContent({ userId }: { userId: string }) {
  const [data, setData] = useState<any>(null);
  const [prices, setPrices] = useState<Record<string, number>>({}); // Prices state
  const [isLoading, setIsLoading] = useState(true);
  const [isCopyTradeModalOpen, setIsCopyTradeModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [selectedCopyTrade, setSelectedCopyTrade] = useState("");
  const [selectedTraderName, setSelectedTraderName] = useState("");

  useEffect(() => {
    getUserDetails(userId).then(async (result) => {
      setData(result);
      if (result?.balances) {
        // Fetch prices for all assets in balance
        const assets = Array.from(new Set(result.balances.map((b: any) => b.asset))) as string[];
        const fetchedPrices = await getCryptoPrices(assets);
        setPrices(fetchedPrices);
      }
      setIsLoading(false);
    });
  }, [userId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-none shadow-sm dark:bg-zinc-900">
              <CardBody className="p-4">
                <Skeleton className="h-4 w-24 rounded-lg mb-2" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="text-center py-12">
        <p className="text-default-500">User not found</p>
        <Link href="/cpanel/users">
          <button className="text-primary mt-4">Back to Users</button>
        </Link>
      </div>
    );
  }

  // Calculate total balance using real-time prices
  const totalBalance = data.balances.reduce((sum: number, b: any) => {
    const price = prices[b.asset] || 0;
    const value = Number(b.amount) * price;
    return sum + value;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/cpanel/users">
          <button className="p-2 hover:bg-default-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{data.profile.full_name || "No Name"}</h1>
          <p className="text-sm text-default-500">{data.profile.email}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wallet size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-default-500">Total Balance</p>
                <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ... (other stats cards unchanged) ... */}
        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp size={20} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-default-500">Total Trades</p>
                <p className="text-2xl font-bold">{data.trades.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Lock size={20} className="text-warning" />
              </div>
              <div>
                <p className="text-sm text-default-500">Active Stakes</p>
                <p className="text-2xl font-bold">{data.stakes.filter((s: any) => s.status === "active").length}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className={`border-none shadow-sm ${data.profile.kyc_status === "manually_verified" || data.profile.kyc_status === "auto_verified"
          ? "bg-success-50 dark:bg-success-900/20"
          : "bg-warning-50 dark:bg-warning-900/20"
          }`}>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${data.profile.kyc_status === "manually_verified" || data.profile.kyc_status === "auto_verified"
                ? "bg-success/10"
                : "bg-warning/10"
                } rounded-lg`}>
                <ShieldCheck size={20} className={
                  data.profile.kyc_status === "manually_verified" || data.profile.kyc_status === "auto_verified"
                    ? "text-success"
                    : "text-warning"
                } />
              </div>
              <div>
                <p className="text-sm text-default-500">KYC Status</p>
                <Chip
                  size="sm"
                  color={
                    data.profile.kyc_status === "manually_verified" || data.profile.kyc_status === "auto_verified"
                      ? "success"
                      : data.profile.kyc_status === "pending"
                        ? "warning"
                        : "danger"
                  }
                >
                  {data.profile.kyc_status || "unverified"}
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Profile Info */}
      <Card className="border-none shadow-sm dark:bg-zinc-900">
        <CardBody className="p-6">
          <h2 className="text-lg font-bold mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-default-500">Full Name</p>
              <p className="font-semibold">{data.profile.full_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Email</p>
              <p className="font-semibold">{data.profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Phone</p>
              <p className="font-semibold">{data.profile.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Country</p>
              <p className="font-semibold">{data.profile.country || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Joined</p>
              <p className="font-semibold">{new Date(data.profile.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Role</p>
              <Chip size="sm" color="primary">{data.profile.role}</Chip>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* KYC Documents */}
      {data.kycSubmission && (
        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-6">
            <h2 className="text-lg font-bold mb-4">KYC Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-default-500 mb-2">ID Number</p>
                <p className="font-semibold">{data.kycSubmission.id_number}</p>
              </div>
              <div>
                <p className="text-sm text-default-500 mb-2">Submitted</p>
                <p className="font-semibold">{new Date(data.kycSubmission.created_at).toLocaleString()}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-default-500 mb-2">Documents</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative h-48 bg-default-100 rounded-lg overflow-hidden">
                    <Image
                      src={data.kycSubmission.document_front_url}
                      alt="Front ID"
                      fill
                      className="object-contain"
                    />
                  </div>
                  {data.kycSubmission.document_back_url && (
                    <div className="relative h-48 bg-default-100 rounded-lg overflow-hidden">
                      <Image
                        src={data.kycSubmission.document_back_url}
                        alt="Back ID"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tabs for detailed data */}
      <Card className="border-none shadow-sm dark:bg-zinc-900">
        <CardBody className="p-0">
          <Tabs aria-label="User data tabs" className="p-4">
            <Tab key="balances" title="Balances">
              <div className="flex justify-between items-center bg-default-50 p-3 rounded-lg mb-4">
                <h3 className="font-semibold">User Balances</h3>
                <Button
                  size="sm"
                  color="primary"
                  startContent={<Plus size={16} />}
                  onPress={() => setIsBalanceModalOpen(true)}
                >
                  Update Balance
                </Button>
              </div>
              <div className="space-y-3">
                {data.balances.length === 0 ? (
                  <p className="text-sm text-default-500 text-center py-8">No balances</p>
                ) : (
                  data.balances.map((balance: any) => {
                    const price = prices[balance.asset] || 0;
                    const usdValue = Number(balance.amount) * price;
                    return (
                      <div key={balance.id} className="flex justify-between items-center p-3 bg-default-50 dark:bg-default-50/5 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{balance.asset}</p>
                            <span className="text-xs text-default-500">(${price.toLocaleString()})</span>
                          </div>
                          <p className="text-xs text-default-500">{balance.account_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          <p className="text-xs text-default-500">{Number(balance.amount).toFixed(8)} {balance.asset}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </Tab>

            <Tab key="wallets" title="Wallets">
              <div className="space-y-3 pt-4">
                {data.wallets.length === 0 ? (
                  <p className="text-sm text-default-500 text-center py-8">No wallets</p>
                ) : (
                  data.wallets.map((wallet: any) => (
                    <div key={wallet.id} className="p-3 bg-default-50 dark:bg-default-50/5 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold">{wallet.label}</p>
                        <Chip size="sm" color={wallet.is_verified ? "success" : "warning"}>
                          {wallet.is_verified ? "Verified" : "Unverified"}
                        </Chip>
                      </div>
                      <p className="text-xs text-default-500 break-all">{wallet.address}</p>
                      <p className="text-xs text-default-400 mt-1">{wallet.network}</p>
                    </div>
                  ))
                )}
              </div>
            </Tab>

            <Tab key="trades" title="Trades">
              <div className="space-y-3 pt-4">
                {data.trades.length === 0 ? (
                  <p className="text-sm text-default-500 text-center py-8">No trades</p>
                ) : (
                  data.trades.map((trade: any) => (
                    <div key={trade.id} className="flex justify-between items-center p-3 bg-default-50 dark:bg-default-50/5 rounded-lg">
                      <div>
                        <p className="font-semibold">{trade.pair}</p>
                        <p className="text-xs text-default-500">{new Date(trade.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <Chip size="sm" color={trade.side === "buy" ? "success" : "danger"}>
                          {trade.side}
                        </Chip>
                        <p className="text-xs mt-1">{Number(trade.amount).toFixed(8)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Tab>

            <Tab key="deposits" title="Deposits">
              <div className="space-y-3 pt-4">
                {data.deposits.length === 0 ? (
                  <p className="text-sm text-default-500 text-center py-8">No deposits</p>
                ) : (
                  data.deposits.map((deposit: any) => (
                    <div key={deposit.id} className="flex justify-between items-center p-3 bg-default-50 dark:bg-default-50/5 rounded-lg">
                      <div>
                        <p className="font-semibold">{deposit.amount} {deposit.asset}</p>
                        <p className="text-xs text-default-500">{new Date(deposit.created_at).toLocaleString()}</p>
                      </div>
                      <Chip
                        size="sm"
                        color={
                          deposit.status === "confirmed" ? "success" :
                            deposit.status === "pending" ? "warning" : "danger"
                        }
                      >
                        {deposit.status}
                      </Chip>
                    </div>
                  ))
                )}
              </div>
            </Tab>

            <Tab key="withdrawals" title="Withdrawals">
              <div className="space-y-3 pt-4">
                {data.withdrawals.length === 0 ? (
                  <p className="text-sm text-default-500 text-center py-8">No withdrawals</p>
                ) : (
                  data.withdrawals.map((withdrawal: any) => (
                    <div key={withdrawal.id} className="flex justify-between items-center p-3 bg-default-50 dark:bg-default-50/5 rounded-lg">
                      <div>
                        <p className="font-semibold">{withdrawal.amount} {withdrawal.asset}</p>
                        <p className="text-xs text-default-500">{new Date(withdrawal.created_at).toLocaleString()}</p>
                      </div>
                      <Chip
                        size="sm"
                        color={
                          withdrawal.status === "completed" ? "success" :
                            withdrawal.status === "pending" ? "warning" : "danger"
                        }
                      >
                        {withdrawal.status}
                      </Chip>
                    </div>
                  ))
                )}
              </div>
            </Tab>

            <Tab key="stakes" title="Stakes">
              <div className="space-y-3 pt-4">
                {data.stakes.length === 0 ? (
                  <p className="text-sm text-default-500 text-center py-8">No stakes</p>
                ) : (
                  data.stakes.map((stake: any) => (
                    <div key={stake.id} className="p-3 bg-default-50 dark:bg-default-50/5 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{stake.staking_pools?.asset} Pool</p>
                          <p className="text-xs text-default-500">APY: {stake.staking_pools?.apy_rate}%</p>
                        </div>
                        <Chip size="sm" color={stake.status === "active" ? "success" : "default"}>
                          {stake.status}
                        </Chip>
                      </div>
                      <p className="text-sm">Amount: {Number(stake.amount).toFixed(8)}</p>
                      <p className="text-xs text-default-400 mt-1">
                        Staked: {new Date(stake.staked_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Tab>

            <Tab key="copy-trading" title="Copy Trading">
              <div className="space-y-6 pt-4">
                {/* Active Subscriptions */}
                <div>
                  <h3 className="text-sm font-semibold text-default-500 mb-3">Active Subscriptions</h3>
                  {data.copyTrades?.length === 0 ? (
                    <p className="text-sm text-default-500 text-center py-4 bg-default-50 rounded-lg">No active copy trades</p>
                  ) : (
                    <div className="space-y-3">
                      {data.copyTrades?.map((ct: any) => (
                        <div key={ct.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-default-50 dark:bg-default-50/5 rounded-lg gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-default-200 overflow-hidden">
                              {(ct.traders?.avatar || ct.traders?.avatar_url) && (
                                <img
                                  src={ct.traders.avatar || ct.traders.avatar_url}
                                  alt={ct.traders?.name || "Trader"}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <p className="font-bold">{ct.traders?.name || "Unknown Trader"}</p>
                              <div className="flex gap-2 text-xs text-default-500">
                                <span>Total Profit: ${ct.total_profit?.toFixed(2)}</span>
                                <span>•</span>
                                <span>Trades: {ct.total_trades}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Chip size="sm" color={ct.status === 'active' ? 'success' : 'default'} variant="flat">
                              {ct.status}
                            </Chip>
                            {ct.status === 'active' && (
                              <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                onPress={async () => {
                                  const result = await adminStopCopyTrade(ct.id);
                                  if (result.success) {
                                    addToast({ title: "Copy trade stopped", color: "success" });
                                    getUserDetails(userId).then(setData);
                                  } else {
                                    addToast({ title: result.error || "Failed to stop", color: "danger" });
                                  }
                                }}
                              >
                                Stop
                              </Button>
                            )}
                            <Button
                              size="sm"
                              color="primary"
                              variant="flat"
                              onPress={() => {
                                setSelectedCopyTrade(ct.id);
                                setSelectedTraderName(ct.traders?.name);
                                setIsCopyTradeModalOpen(true);
                              }}
                            >
                              Add Outcome
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Trade History */}
                <div>
                  <h3 className="text-sm font-semibold text-default-500 mb-3">Copy Trade History</h3>
                  {data.copyTradePositions?.length === 0 ? (
                    <p className="text-sm text-default-500 text-center py-8">No copy trade history</p>
                  ) : (
                    <div className="space-y-2">
                      {data.copyTradePositions?.map((pos: any) => (
                        <div key={pos.id} className="flex justify-between items-center p-3 border border-default-100 dark:border-default-50/10 rounded-lg">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">{pos.pair}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${pos.side === 'buy' ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'}`}>
                                {pos.side.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-default-500 mt-0.5">
                              Trader: {pos.traders?.name} • {new Date(pos.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-sm ${pos.profit_loss >= 0 ? 'text-success' : 'text-danger'}`}>
                              {pos.profit_loss >= 0 ? '+' : ''}{pos.profit_loss} USDT
                            </p>
                            <p className="text-xs text-default-500">Entry: {pos.entry_price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      <AddCopyTradeResultModal
        isOpen={isCopyTradeModalOpen}
        onOpenChange={() => setIsCopyTradeModalOpen(false)}
        copyTradeId={selectedCopyTrade}
        traderName={selectedTraderName}
      />

      <UpdateBalanceModal
        isOpen={isBalanceModalOpen}
        onOpenChange={() => setIsBalanceModalOpen(false)}
        userId={userId}
        existingAssets={data?.balances?.map((b: any) => b.asset) || []}
      />
    </div>
  );
}
