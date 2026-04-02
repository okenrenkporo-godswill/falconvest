"use client";

import { Card, CardBody, Skeleton, Chip, Button } from "@heroui/react";
import { useEffect, useState } from "react";
import { getAdminStats, getLatestActivities } from "@/actions/admin-dashboard";
import { 
  Users, 
  ShieldAlert, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  TrendingUp,
  Activity,
  Wallet,
  Copy,
  Pickaxe,
  UserPlus,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

export function AdminDashboardContent() {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const [statsData, activitiesData] = await Promise.all([
      getAdminStats(),
      getLatestActivities(),
    ]);
    setStats(statsData);
    setActivities(activitiesData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64 rounded-lg mb-2" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="border-none shadow-sm dark:bg-zinc-900">
              <CardBody className="p-4">
                <Skeleton className="h-4 w-24 rounded-lg mb-2" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border-none shadow-sm dark:bg-zinc-900">
              <CardBody className="p-4 space-y-3">
                <Skeleton className="h-6 w-32 rounded-lg mb-3" />
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48 rounded-lg" />
                      <Skeleton className="h-3 w-32 rounded-lg" />
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-default-500 mt-1">
            Overview of platform activity and pending actions
          </p>
        </div>
        <Button
          size="sm"
          variant="flat"
          startContent={<RefreshCw size={16} />}
          onPress={loadData}
        >
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/cpanel/users">
          <Card className="border-none shadow-sm dark:bg-zinc-900 hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Total Users</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                  <p className="text-xs text-default-400 mt-1">
                    {stats.verifiedUsers} verified
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link href="/cpanel/kyc-pending">
          <Card className="border-none shadow-sm bg-warning-50 dark:bg-warning-900/20 hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <ShieldAlert size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm text-warning-700 dark:text-warning-300">Pending KYC</p>
                  <p className="text-3xl font-bold text-warning-900 dark:text-warning-100 mt-1">
                    {stats.pendingKyc}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link href="/cpanel/users">
          <Card className="border-none shadow-sm bg-zinc-50 dark:bg-zinc-800/20 hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-500/10 rounded-lg">
                  <UserPlus size={20} className="text-zinc-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">Unverified Users</p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                    {stats.unverifiedUsers}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link href="/cpanel/deposits">
          <Card className="border-none shadow-sm bg-success-50 dark:bg-success-900/20 hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <ArrowDownCircle size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-sm text-success-700 dark:text-success-300">Deposits</p>
                  <p className="text-3xl font-bold text-success-900 dark:text-success-100 mt-1">
                    {stats.pendingDeposits}
                  </p>
                  <p className="text-xs text-success-600 dark:text-success-400 mt-1">
                    {stats.confirmedDeposits} confirmed • {stats.rejectedDeposits} rejected • {formatCurrency(stats.totalDepositValue)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link href="/cpanel/withdrawals">
          <Card className="border-none shadow-sm bg-danger-50 dark:bg-danger-900/20 hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-danger/10 rounded-lg">
                  <ArrowUpCircle size={20} className="text-danger" />
                </div>
                <div>
                  <p className="text-sm text-danger-700 dark:text-danger-300">Withdrawals</p>
                  <p className="text-3xl font-bold text-danger-900 dark:text-danger-100 mt-1">
                    {stats.pendingWithdrawals}
                  </p>
                  <p className="text-xs text-danger-600 dark:text-danger-400 mt-1">
                    {stats.confirmedWithdrawals} confirmed • {stats.rejectedWithdrawals} rejected • {formatCurrency(stats.totalWithdrawalValue)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link href="/cpanel/trades">
          <Card className="border-none shadow-sm dark:bg-zinc-900 hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp size={20} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Total Trades</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalTrades}</p>
                  <p className="text-xs text-default-400 mt-1">
                    {stats.activePositions} open positions
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link href="/cpanel/copy-trades">
          <Card className="border-none shadow-sm dark:bg-zinc-900 hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Copy size={20} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Copy Trades</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalCopyTrades}</p>
                  <p className="text-xs text-default-400 mt-1">{stats.activeCopyTrades} active</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link href="/cpanel/staking">
          <Card className="border-none shadow-sm dark:bg-zinc-900 hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Pickaxe size={20} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Active Stakes</p>
                  <p className="text-3xl font-bold mt-1">{stats.activeStakes}</p>
                  <p className="text-xs text-default-400 mt-1">Users staking</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Wallet size={20} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-default-500">Net Flow</p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(stats.totalDepositValue - stats.totalWithdrawalValue)}
                </p>
                <p className="text-xs text-default-400 mt-1">Deposits - Withdrawals</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Latest Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Creations */}
        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus size={18} className="text-primary" />
              <h2 className="text-lg font-bold">Latest Account Creations</h2>
            </div>
            <div className="space-y-3">
              {activities.accounts.length === 0 ? (
                <p className="text-sm text-default-500 text-center py-8">No accounts yet</p>
              ) : (
                activities.accounts.map((account: any) => (
                  <Link key={account.id} href={`/cpanel/users/${account.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-50/5 hover:bg-default-100 dark:hover:bg-default-50/10 transition-colors cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{account.display_name}</p>
                        <p className="text-sm text-default-500 truncate">{account.email}</p>
                      </div>
                      <p className="text-xs text-default-400 ml-3">
                        {formatDate(account.created_at)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardBody>
        </Card>

        {/* Deposits */}
        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ArrowDownCircle size={18} className="text-success" />
              <h2 className="text-lg font-bold">Latest Deposits</h2>
            </div>
            <div className="space-y-3">
              {activities.deposits.length === 0 ? (
                <p className="text-sm text-default-500 text-center py-8">No deposits yet</p>
              ) : (
                activities.deposits.map((deposit: any) => (
                  <div
                    key={deposit.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-50/5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{deposit.user_name}</p>
                      <p className="text-sm text-default-500">
                        {deposit.amount} {deposit.coin} • {formatCurrency(deposit.usd_value)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Chip
                        size="sm"
                        color={
                          deposit.status === "confirmed"
                            ? "success"
                            : deposit.status === "pending"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {deposit.status}
                      </Chip>
                      <p className="text-xs text-default-400 whitespace-nowrap">
                        {formatDate(deposit.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>

        {/* Withdrawals */}
        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ArrowUpCircle size={18} className="text-danger" />
              <h2 className="text-lg font-bold">Latest Withdrawals</h2>
            </div>
            <div className="space-y-3">
              {activities.withdrawals.length === 0 ? (
                <p className="text-sm text-default-500 text-center py-8">No withdrawals yet</p>
              ) : (
                activities.withdrawals.map((withdrawal: any) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-50/5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{withdrawal.user_name}</p>
                      <p className="text-sm text-default-500">
                        {withdrawal.amount} {withdrawal.coin} • {formatCurrency(withdrawal.usd_value)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Chip
                        size="sm"
                        color={
                          withdrawal.status === "approved" || withdrawal.status === "completed"
                            ? "success"
                            : withdrawal.status === "pending" || withdrawal.status === "processing"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {withdrawal.status}
                      </Chip>
                      <p className="text-xs text-default-400 whitespace-nowrap">
                        {formatDate(withdrawal.requested_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>

        {/* Trades */}
        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-blue-500" />
              <h2 className="text-lg font-bold">Latest Trades</h2>
            </div>
            <div className="space-y-3">
              {activities.trades.length === 0 ? (
                <p className="text-sm text-default-500 text-center py-8">No trades yet</p>
              ) : (
                activities.trades.map((trade: any) => (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-50/5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{trade.user_name}</p>
                      <p className="text-sm text-default-500">
                        <span className={trade.side === "buy" ? "text-success" : "text-danger"}>
                          {trade.side.toUpperCase()}
                        </span>{" "}
                        {trade.amount} {trade.pair} @ ${trade.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Chip
                        size="sm"
                        color={
                          trade.status === "completed"
                            ? "success"
                            : trade.status === "pending"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {trade.status}
                      </Chip>
                      <p className="text-xs text-default-400 whitespace-nowrap">
                        {formatDate(trade.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>

        {/* Copy Trades */}
        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Copy size={18} className="text-purple-500" />
              <h2 className="text-lg font-bold">Latest Copy Trades</h2>
            </div>
            <div className="space-y-3">
              {activities.copyTrades.length === 0 ? (
                <p className="text-sm text-default-500 text-center py-8">No copy trades yet</p>
              ) : (
                activities.copyTrades.map((copyTrade: any) => (
                  <div
                    key={copyTrade.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-50/5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{copyTrade.user_name}</p>
                      <p className="text-sm text-default-500">
                        Copying {copyTrade.trader_name} • {formatCurrency(copyTrade.copy_amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Chip
                        size="sm"
                        color={
                          copyTrade.status === "active"
                            ? "success"
                            : copyTrade.status === "paused"
                            ? "warning"
                            : "default"
                        }
                      >
                        {copyTrade.status}
                      </Chip>
                      <p className="text-xs text-default-400 whitespace-nowrap">
                        {formatDate(copyTrade.started_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
