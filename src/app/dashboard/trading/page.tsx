"use client";

import { TradingChart } from "@/components/trading/trading-chart";
import { OrderBook } from "@/components/trading/order-book";
import { OrderForm } from "@/components/trading/order-form";
import { TradingHeader } from "@/components/trading/trading-header";
import { Card, CardBody, Tabs, Tab, Chip, Button, Skeleton, addToast } from "@heroui/react";
import { useState, useEffect } from "react";
import { Wallet, X } from "lucide-react";
import { useTradingStore } from "@/lib/store/trading-store";
import { getUserPositions, getUserTrades, getTradingBalance, closePosition, executeMarketOrder } from "@/actions/trading";
import Link from "next/link";

export default function TradingPage() {
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [closingPosition, setClosingPosition] = useState<string | null>(null);
  
  const { positions, trades, balance, setPositions, setTrades, setBalance, addTrade, removePosition, updateBalance } = useTradingStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [positionsData, tradesData, balanceData] = await Promise.all([
      getUserPositions(),
      getUserTrades(),
      getTradingBalance(),
    ]);
    
    setPositions(positionsData.positions);
    setTrades(tradesData.trades);
    setBalance(balanceData.balance);
    setLoading(false);
  };

  const handleOrderSubmit = async (order: {
    side: "buy" | "sell";
    amount: number;
    price: number;
  }): Promise<{ success?: boolean; error?: string }> => {
    
    // Optimistic update - add to store immediately
    const newTrade = {
      id: `temp-${Date.now()}`,
      pair: symbol,
      side: order.side,
      type: "market" as const,
      amount: order.amount,
      price: order.price,
      total: order.amount * order.price,
      fee: order.amount * order.price * 0.001,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    
    console.log("Creating trade record:", newTrade);
    addTrade(newTrade);
    
    // Update balance optimistically
    const total = order.amount * order.price;
    const fee = total * 0.001;
    if (order.side === "buy") {
      updateBalance(-(total + fee));
      console.log("Deducting from balance:", total + fee);
    }

    // Save to database in background
    console.log("Calling executeMarketOrder action...");
    const result = await executeMarketOrder({
      pair: symbol,
      side: order.side,
      amount: order.amount,
      price: order.price,
    });

    console.log("executeMarketOrder result:", result);

    if (result.error) {
      console.error("Order failed:", result.error);
      addToast({
        title: "Error",
        description: result.error,
        color: "danger",
      });
      // Revert optimistic update
      loadData();
      return { error: result.error };
    } else {
      console.log("Order successful!");
      addToast({
        title: "Success",
        description: `${order.side === "buy" ? "Bought" : "Sold"} ${order.amount} ${symbol.split("/")[0]}`,
        color: "success",
      });
      // Refresh to get actual data
      loadData();
      return { success: true };
    }
  };

  const handleClosePosition = async (positionId: string, currentPrice: number) => {
    setClosingPosition(positionId);
    
    // Optimistic update
    removePosition(positionId);
    
    const result = await closePosition(positionId, currentPrice);
    setClosingPosition(null);

    if (result.error) {
      addToast({
        title: "Error",
        description: result.error,
        color: "danger",
      });
      loadData();
    } else {
      addToast({
        title: "Success",
        description: `Position closed. P&L: ${result.pnl?.toFixed(2)} USDT`,
        color: result.pnl && result.pnl > 0 ? "success" : "danger",
      });
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-54px)] lg:absolute lg:left-0 lg:top-0 w-full flex flex-col gap-2 overflow-hidden">
      <div className="lg:grid flex flex-col lg:grid-cols-7 h-full lg:grid-rows-7 gap-4 overflow-hidden">
        {/* Left: Chart & History */}
        <div className="col-span-5 row-span-6">
          <div className={`grid grid-rows-[auto_1fr_auto] h-full gap-5 min-w-0 transition-all duration-300 ${isChartOpen ? "grid" : "hidden lg:grid"}`}>
            {/* Wallet Card */}
            <Card className="border-none bg-background shadow-sm dark:bg-zinc-900 flex-shrink-0">
              <CardBody className="p-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet size={18} className="text-default-500" />
                  <span className="text-sm text-default-500">Trading Balance</span>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold">{balance.toFixed(2)} USDT</p>
                  <Link href="/dashboard/deposit?account=trading">
                    <Button size="sm" color="primary" variant="flat">
                      Deposit
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>

            {/* Chart */}
            <TradingChart symbol={symbol.replace("/", "")} />

            {/* History Tabs (Desktop) */}
            <Card className="h-[250px] border-none shadow-sm dark:bg-zinc-900 flex-shrink-0 hidden lg:flex">
              <CardBody className="p-0">
                <HistoryTabs 
                  positions={positions} 
                  trades={trades}
                  onClosePosition={handleClosePosition}
                  closingPosition={closingPosition}
                />
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Header */}
        <div className="col-span-5 col-start-1 row-start-7 flex align-bottom">
          <TradingHeader
            symbol={symbol.replace("/", "")}
            onSymbolChange={(sym) => setSymbol(sym.replace("USDT", "/USDT"))}
            onToggleChart={() => setIsChartOpen(!isChartOpen)}
          />
        </div>

        {/* Right: Order Book & Form */}
        <div className="col-span-2 row-span-7 col-start-6 h-full row-start-1">
          <div className="flex-shrink-0 flex h-full flex-col gap-2 overflow-y-auto">
            <div className="flex flex-row lg:flex-col gap-2 h-full min-h-[400px]">
              {/* Order Form */}
              <div className="flex-[1.5] lg:flex-shrink-0 order-1 lg:order-2">
                <OrderForm 
                  symbol={symbol.replace("/", "")} 
                  onOrder={handleOrderSubmit}
                  balance={balance}
                />
              </div>

              {/* Order Book */}
              <div className="flex-1 lg:flex-grow lg:min-h-[400px] order-2 lg:order-1">
                <div className="h-full block lg:hidden">
                  <OrderBook symbol={symbol.replace("/", "")} compact={true} />
                </div>
                <div className="h-full hidden lg:block">
                  <OrderBook symbol={symbol.replace("/", "")} compact={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile History Tabs */}
      <div className="flex-shrink-0 lg:hidden h-[250px] min-h-[250px]">
        <Card className="h-full border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-0">
            <HistoryTabs 
              positions={positions} 
              trades={trades}
              onClosePosition={handleClosePosition}
              closingPosition={closingPosition}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function HistoryTabs({ 
  positions, 
  trades,
  onClosePosition,
  closingPosition
}: { 
  positions: any[];
  trades: any[];
  onClosePosition: (id: string, price: number) => void;
  closingPosition: string | null;
}) {
  return (
    <Tabs
      aria-label="History"
      variant="underlined"
      classNames={{
        cursor: "w-full bg-primary",
        tabList: "p-0 border-b border-default-100",
        tabContent: "group-data-[selected=true]:text-primary font-medium",
      }}
    >
      <Tab
        key="positions"
        title={
          <div className="flex items-center gap-2">
            <span>Open Positions</span>
            <Chip size="sm" variant="flat" color="primary">
              {positions.length}
            </Chip>
          </div>
        }
      >
        <div className="p-0 overflow-auto h-[180px]">
          {positions.length === 0 ? (
            <div className="p-8 text-center text-default-400 text-sm">
              No open positions
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-default-400 border-b border-default-100 dark:border-default-50/10 sticky top-0 bg-background z-10">
                <tr>
                  <th className="p-3 font-medium">Time</th>
                  <th className="p-3 font-medium">Pair</th>
                  <th className="p-3 font-medium">Side</th>
                  <th className="p-3 font-medium text-right">Entry</th>
                  <th className="p-3 font-medium text-right">Amount</th>
                  <th className="p-3 font-medium text-right">Leverage</th>
                  <th className="p-3 font-medium text-right">PnL</th>
                  <th className="p-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="text-default-600">
                {positions.map((pos) => (
                  <tr
                    key={pos.id}
                    className="border-b border-default-50 dark:border-default-50/5 hover:bg-default-50 dark:hover:bg-default-50/5"
                  >
                    <td className="p-3">{new Date(pos.opened_at).toLocaleTimeString()}</td>
                    <td className="p-3 font-bold">{pos.pair}</td>
                    <td className={`p-3 font-bold ${pos.side === "long" ? "text-green-500" : "text-red-500"}`}>
                      {pos.side.toUpperCase()}
                    </td>
                    <td className="p-3 text-right">{pos.entry_price.toLocaleString()}</td>
                    <td className="p-3 text-right">{pos.amount}</td>
                    <td className="p-3 text-right">{pos.leverage}x</td>
                    <td className={`p-3 text-right ${pos.unrealized_pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {pos.unrealized_pnl?.toFixed(2)} USDT
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        isIconOnly
                        onPress={() => onClosePosition(pos.id, pos.entry_price)}
                        isLoading={closingPosition === pos.id}
                      >
                        <X size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Tab>
      
      <Tab 
        key="history" 
        title={
          <div className="flex items-center gap-2">
            <span>Trade History</span>
            <Chip size="sm" variant="flat">
              {trades.length}
            </Chip>
          </div>
        }
      >
        <div className="p-0 overflow-auto h-[180px]">
          {trades.length === 0 ? (
            <div className="p-8 text-center text-default-400 text-sm">
              No trade history
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-default-400 border-b border-default-100 dark:border-default-50/10 sticky top-0 bg-background z-10">
                <tr>
                  <th className="p-3 font-medium">Time</th>
                  <th className="p-3 font-medium">Pair</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Side</th>
                  <th className="p-3 font-medium text-right">Price</th>
                  <th className="p-3 font-medium text-right">Amount</th>
                  <th className="p-3 font-medium text-right">Total</th>
                  <th className="p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-default-600">
                {trades.map((trade) => (
                  <tr
                    key={trade.id}
                    className="border-b border-default-50 dark:border-default-50/5 hover:bg-default-50 dark:hover:bg-default-50/5"
                  >
                    <td className="p-3">{new Date(trade.created_at).toLocaleTimeString()}</td>
                    <td className="p-3 font-bold">{trade.pair}</td>
                    <td className="p-3 capitalize">{trade.type}</td>
                    <td className={`p-3 font-bold ${trade.side === "buy" ? "text-green-500" : "text-red-500"}`}>
                      {trade.side.toUpperCase()}
                    </td>
                    <td className="p-3 text-right">{trade.price.toLocaleString()}</td>
                    <td className="p-3 text-right">{trade.amount}</td>
                    <td className="p-3 text-right">{trade.total.toFixed(2)}</td>
                    <td className="p-3">
                      <Chip size="sm" color={trade.status === "completed" ? "success" : "warning"} variant="flat">
                        {trade.status}
                      </Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Tab>
    </Tabs>
  );
}
