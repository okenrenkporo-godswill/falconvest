"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Skeleton, Chip } from "@heroui/react";
import { getAllHoldings, getHoldingsStats } from "@/actions/admin-holdings";
import { Wallet, TrendingUp, Lock, Users } from "lucide-react";

type Holding = {
  user_id: string;
  asset: string;
  total: number;
  trading: number;
  staking: number;
};

type Stats = {
  totalAssets: number;
  totalUsers: number;
  totalValue: number;
};

export default function AdminHoldingsPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [holdingsData, statsData] = await Promise.all([
      getAllHoldings(),
      getHoldingsStats(),
    ]);
    setHoldings(holdingsData as Holding[]);
    setStats(statsData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Holdings Management</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="p-4">
            <p className="text-sm text-default-500">Total Assets</p>
            <p className="text-2xl font-bold">{stats?.totalAssets || 0}</p>
          </CardBody>
        </Card>
        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="p-4">
            <p className="text-sm text-default-500">Total Users</p>
            <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
          </CardBody>
        </Card>
        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="p-4">
            <p className="text-sm text-default-500">Total Holdings</p>
            <p className="text-2xl font-bold">{holdings.length}</p>
          </CardBody>
        </Card>
      </div>

      {/* Holdings List */}
      <div className="grid gap-4">
        {holdings.map((holding, idx) => (
          <Card key={idx} className="border-none shadow-sm dark:bg-content1/50">
            <CardBody className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-2 md:p-3 rounded-lg bg-primary/10">
                    <Wallet className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{holding.asset}</h3>
                    <p className="text-xs md:text-sm text-default-500">
                      User: {holding.user_id.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 md:flex md:items-center md:gap-8">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-default-500 mb-1">Total</p>
                    <p className="font-bold text-sm md:text-base">{holding.total.toFixed(6)}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs text-default-500 mb-1">
                      <TrendingUp size={12} className="inline mr-1" />
                      Trading
                    </p>
                    <p className="font-semibold text-sm md:text-base">{holding.trading.toFixed(6)}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs text-default-500 mb-1">
                      <Lock size={12} className="inline mr-1" />
                      Staking
                    </p>
                    <p className="font-semibold text-sm md:text-base">{holding.staking.toFixed(6)}</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
