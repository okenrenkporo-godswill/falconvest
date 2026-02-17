"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Avatar, Button, Chip, Skeleton, addToast } from "@heroui/react";
import { getUserCopyTrades, stopCopyTrading } from "@/actions/copy-trading";
import { Users, X, TrendingUp } from "lucide-react";
import { CopyTradeResultsModal } from "@/components/copy-trading/copy-trade-results-modal";

type CopyTrade = {
  id: string;
  trader_id: string;
  copy_amount: number;
  status: string;
  total_profit: number;
  total_trades: number;
  started_at: string;
  trader?: {
    display_name: string;
    avatar_url: string | null;
    win_rate: number;
    total_followers: number;
  };
};

export default function MyCopyTradesPage() {
  const [copyTrades, setCopyTrades] = useState<CopyTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCopyTrade, setSelectedCopyTrade] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadCopyTrades();
  }, []);

  const loadCopyTrades = async () => {
    const data = await getUserCopyTrades();
    setCopyTrades(data);
    setLoading(false);
  };

  const handleStop = async (copyTradeId: string, traderName: string) => {
    const result = await stopCopyTrading(copyTradeId);
    if (result.error) {
      addToast({
        title: "Error",
        description: result.error,
        color: "danger",
      });
    } else {
      addToast({
        title: "Success",
        description: `Stopped copying ${traderName}`,
        color: "success",
      });
      loadCopyTrades();
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <Skeleton className="h-10 w-48" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Copy Trades</h1>
        <Button
          as="a"
          href="/dashboard/copy-trading"
          size="sm"
          variant="flat"
        >
          Browse Traders
        </Button>
      </div>

      {copyTrades.length === 0 ? (
        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="text-center py-12">
            <p className="text-default-500 mb-4">You are not copying any traders yet</p>
            <Button
              as="a"
              href="/dashboard/copy-trading"
              className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
            >
              Browse Traders
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4">
          {copyTrades.map((ct) => (
            <Card key={ct.id} className="border-none shadow-sm dark:bg-content1/50">
              <CardBody className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Trader Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar
                      src={ct.trader?.avatar_url || undefined}
                      name={ct.trader?.display_name}
                      className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 text-white"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{ct.trader?.display_name}</h3>
                        <Chip
                          color={ct.status === "active" ? "success" : "default"}
                          variant="flat"
                          size="sm"
                        >
                          {ct.status}
                        </Chip>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-default-500">
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {ct.trader?.total_followers} followers
                        </span>
                        <span>Win Rate: {ct.trader?.win_rate}%</span>
                        <span className="text-xs text-default-400">
                          Started {new Date(ct.started_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Stats Grid */}
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-xs text-default-500 mb-1">Copy Amount</p>
                      <p className="text-lg font-bold">${ct.copy_amount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-default-500 mb-1">Total Profit</p>
                      <p className={`text-lg font-bold ${ct.total_profit >= 0 ? "text-success" : "text-danger"}`}>
                        {ct.total_profit >= 0 ? "+" : ""}${ct.total_profit.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-default-500 mb-1">Trades</p>
                      <p className="text-lg font-bold">{ct.total_trades}</p>
                    </div>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={() => setSelectedCopyTrade({ id: ct.id, name: ct.trader?.display_name || "Trader" })}
                      startContent={<TrendingUp size={16} />}
                    >
                      View Results
                    </Button>
                    {ct.status === "active" && (
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => handleStop(ct.id, ct.trader?.display_name || "trader")}
                        startContent={<X size={16} />}
                      >
                        Stop
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {selectedCopyTrade && (
        <CopyTradeResultsModal
          isOpen={!!selectedCopyTrade}
          onClose={() => setSelectedCopyTrade(null)}
          copyTradeId={selectedCopyTrade.id}
          traderName={selectedCopyTrade.name}
        />
      )}
    </div>
  );
}
