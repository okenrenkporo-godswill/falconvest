"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Skeleton, Tabs, Tab, Chip, Button, addToast } from "@heroui/react";
import { getAllTrades, getAllPositions, adminClosePosition, getTradingStats } from "@/actions/admin-trading";
import { TrendingUp, Target, DollarSign, Activity, X } from "lucide-react";
import { Pagination } from "@/components/shared/pagination";

type Trade = {
  id: string;
  user_id: string;
  pair: string;
  side: "buy" | "sell";
  type: string;
  amount: number;
  price: number;
  total: number;
  fee: number;
  status: string;
  created_at: string;
};

type Position = {
  id: string;
  user_id: string;
  pair: string;
  side: "long" | "short";
  entry_price: number;
  amount: number;
  leverage: number;
  unrealized_pnl: number;
  status: string;
  opened_at: string;
};

type Stats = {
  totalTrades: number;
  totalVolume: number;
  totalFees: number;
  openPositions: number;
  totalPnL: number;
};

export default function AdminTradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [closingPosition, setClosingPosition] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("trades");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage]);

  const loadData = async (page: number) => {
    setLoading(true);
    const [tradesResult, positionsData, statsData] = await Promise.all([
      getAllTrades(page, 25),
      getAllPositions(),
      getTradingStats(),
    ]);
    setTrades(tradesResult.data);
    setTotalPages(tradesResult.totalPages);
    setPositions(positionsData);
    setStats(statsData);
    setLoading(false);
  };

  const handleClosePosition = async (positionId: string, closePrice: number) => {
    setClosingPosition(positionId);
    const result = await adminClosePosition(positionId, closePrice);
    setClosingPosition(null);

    if (result.error) {
      addToast({
        title: "Error",
        description: result.error,
        color: "danger",
      });
    } else {
      addToast({
        title: "Success",
        description: `Position closed. P&L: ${result.pnl?.toFixed(2)} USDT`,
        color: result.pnl && result.pnl > 0 ? "success" : "danger",
      });
      loadData(currentPage);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Trading Monitoring</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-default-500" />
              <p className="text-sm text-default-500">Total Trades</p>
            </div>
            <p className="text-2xl font-bold">{stats?.totalTrades || 0}</p>
          </CardBody>
        </Card>
        
        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-default-500" />
              <p className="text-sm text-default-500">Total Volume</p>
            </div>
            <p className="text-2xl font-bold">${stats?.totalVolume.toLocaleString() || 0}</p>
          </CardBody>
        </Card>
        
        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-default-500" />
              <p className="text-sm text-default-500">Total Fees</p>
            </div>
            <p className="text-2xl font-bold">${stats?.totalFees.toLocaleString() || 0}</p>
          </CardBody>
        </Card>
        
        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-default-500" />
              <p className="text-sm text-default-500">Open Positions</p>
            </div>
            <p className="text-2xl font-bold">{stats?.openPositions || 0}</p>
          </CardBody>
        </Card>
        
        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-default-500" />
              <p className="text-sm text-default-500">Total P&L</p>
            </div>
            <p className={`text-2xl font-bold ${stats && stats.totalPnL >= 0 ? "text-success" : "text-danger"}`}>
              ${stats?.totalPnL.toLocaleString() || 0}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)}>
        <Tab 
          key="trades" 
          title={
            <div className="flex items-center gap-2">
              <span>All Trades</span>
              <Chip size="sm" variant="flat">{trades.length}</Chip>
            </div>
          }
        >
          <div className="mt-4 space-y-4">
            {trades.map((trade) => (
              <Card key={trade.id} className="border-none shadow-sm dark:bg-content1/50">
                <CardBody className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`p-2 md:p-3 rounded-lg ${trade.side === "buy" ? "bg-success/10" : "bg-danger/10"}`}>
                        <TrendingUp className={trade.side === "buy" ? "text-success" : "text-danger"} size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{trade.pair}</h3>
                        <p className="text-xs md:text-sm text-default-500">
                          User: {trade.user_id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 md:flex md:items-center md:gap-8">
                      <div className="text-left md:text-right">
                        <p className="text-xs text-default-500 mb-1">Side</p>
                        <Chip 
                          size="sm" 
                          color={trade.side === "buy" ? "success" : "danger"}
                          variant="flat"
                        >
                          {trade.side.toUpperCase()}
                        </Chip>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-xs text-default-500 mb-1">Amount</p>
                        <p className="font-semibold text-sm md:text-base">{trade.amount}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-xs text-default-500 mb-1">Price</p>
                        <p className="font-semibold text-sm md:text-base">${trade.price.toLocaleString()}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-xs text-default-500 mb-1">Total</p>
                        <p className="font-bold text-sm md:text-base">${trade.total.toLocaleString()}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-xs text-default-500 mb-1">Status</p>
                        <Chip 
                          size="sm" 
                          color={trade.status === "completed" ? "success" : "warning"}
                          variant="flat"
                        >
                          {trade.status}
                        </Chip>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}

            {trades.length === 0 && (
              <Card className="border-none shadow-sm dark:bg-content1/50">
                <CardBody className="text-center py-12 text-default-500">
                  No trades yet
                </CardBody>
              </Card>
            )}
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </Tab>

        <Tab 
          key="positions" 
          title={
            <div className="flex items-center gap-2">
              <span>Open Positions</span>
              <Chip size="sm" variant="flat" color="primary">{positions.filter(p => p.status === "open").length}</Chip>
            </div>
          }
        >
          <div className="mt-4 space-y-4">
            {positions.filter(p => p.status === "open").map((position) => (
              <Card key={position.id} className="border-none shadow-sm dark:bg-content1/50">
                <CardBody className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`p-2 md:p-3 rounded-lg ${position.side === "long" ? "bg-success/10" : "bg-danger/10"}`}>
                        <Target className={position.side === "long" ? "text-success" : "text-danger"} size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{position.pair}</h3>
                        <p className="text-xs md:text-sm text-default-500">
                          User: {position.user_id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 md:flex md:items-center md:gap-8">
                      <div className="text-left md:text-right">
                        <p className="text-xs text-default-500 mb-1">Side</p>
                        <Chip 
                          size="sm" 
                          color={position.side === "long" ? "success" : "danger"}
                          variant="flat"
                        >
                          {position.side.toUpperCase()}
                        </Chip>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-xs text-default-500 mb-1">Entry</p>
                        <p className="font-semibold text-sm md:text-base">${position.entry_price.toLocaleString()}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-xs text-default-500 mb-1">Amount</p>
                        <p className="font-semibold text-sm md:text-base">{position.amount}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-xs text-default-500 mb-1">Leverage</p>
                        <p className="font-semibold text-sm md:text-base">{position.leverage}x</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-xs text-default-500 mb-1">P&L</p>
                        <p className={`font-bold text-sm md:text-base ${position.unrealized_pnl >= 0 ? "text-success" : "text-danger"}`}>
                          ${position.unrealized_pnl.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <Button
                          size="sm"
                          variant="flat"
                          color="danger"
                          startContent={<X size={16} />}
                          onPress={() => handleClosePosition(position.id, position.entry_price)}
                          isLoading={closingPosition === position.id}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}

            {positions.filter(p => p.status === "open").length === 0 && (
              <Card className="border-none shadow-sm dark:bg-content1/50">
                <CardBody className="text-center py-12 text-default-500">
                  No open positions
                </CardBody>
              </Card>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
