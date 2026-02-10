"use client";

import { TradingChart } from "@/components/trading/trading-chart";
import { OrderBook } from "@/components/trading/order-book";
import { OrderForm } from "@/components/trading/order-form";
import { TradingHeader } from "@/components/trading/trading-header";
import { Card, CardBody, Tabs, Tab, Chip } from "@heroui/react";
import { useState } from "react";

// Types
import { useTradingStore, Position } from "@/lib/store/trading-store";

export default function TradingPage() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const { positions, addPosition } = useTradingStore();
  const [isChartOpen, setIsChartOpen] = useState(false); // Mobile chart toggle

  const handleOrderSubmit = (order: Omit<Position, "id" | "time" | "pnl" | "symbol">) => {
    console.log("Received Order in Page:", order);
    const newPosition: Position = {
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString(),
      symbol: symbol.replace("USDT", "/USDT"),
      ...order,
      pnl: 0
    };

    // Add to global store
    addPosition(newPosition);
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col p-2 gap-2 overflow-hidden">

      {/* Top Bar: Trading Header (Selector & Stats & Chart Toggle) */}
      <div className="flex-shrink-0 z-20">
        <TradingHeader
          symbol={symbol}
          onSymbolChange={setSymbol}
          onToggleChart={() => setIsChartOpen(!isChartOpen)}
        />
      </div>

      {/* Main Content Areas */}
      <div className="flex-grow flex flex-col lg:flex-row gap-2 overflow-hidden min-h-0">

        {/* Left/Center: Chart & History */}
        {/* Mobile: Chart handles visibility. Desktop: Always visible */}
        <div className={`flex-grow flex flex-col gap-2 min-w-0 transition-all duration-300 ${isChartOpen ? 'flex h-[400px] lg:h-auto' : 'hidden lg:flex'}`}>
          {/* Chart Container */}
          <div className="flex-grow min-h-[300px] lg:min-h-[400px] bg-default-50 dark:bg-zinc-900 rounded-xl overflow-hidden border border-default-200 dark:border-default-100/10 z-0">
            <TradingChart symbol={symbol} />
          </div>

          {/* History Tabs (Desktop Only Place - moved to bottom for mobile) */}
          <Card className="h-[250px] border-none shadow-sm dark:bg-zinc-900 flex-shrink-0 hidden lg:flex">
            <CardBody className="p-0">
              <HistoryTabs positions={positions} />
            </CardBody>
          </Card>
        </div>

        {/* Right Sidebar: Order Book & Form */}
        {/* Mobile: Split View (Form + Compact Book) */}
        <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 flex flex-col gap-2 overflow-y-auto">

          {/* Mobile Split Wrapper */}
          <div className="flex flex-row lg:flex-col gap-2 h-full min-h-[400px]">

            {/* Order Form (Left on Mobile, Bottom on Desktop) */}
            <div className="flex-[1.5] lg:flex-shrink-0 order-1 lg:order-2">
              <OrderForm symbol={symbol} onOrder={handleOrderSubmit} />
            </div>

            {/* Order Book (Right on Mobile, Top on Desktop) */}
            <div className="flex-1 lg:flex-grow lg:min-h-[400px] order-2 lg:order-1">
              {/* Pass compact=true for mobile styling logic if needed, or handle via CSS */}
              <div className="h-full block lg:hidden">
                <OrderBook symbol={symbol} compact={true} />
              </div>
              <div className="h-full hidden lg:block">
                <OrderBook symbol={symbol} compact={false} />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Mobile History Tabs (Visible at bottom on mobile) */}
      <div className="flex-shrink-0 lg:hidden h-[250px] min-h-[250px]">
        <Card className="h-full border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-0">
            <HistoryTabs positions={positions} />
          </CardBody>
        </Card>
      </div>

    </div>
  );
}

function HistoryTabs({ positions }: { positions: Position[] }) {
  return (
    <Tabs aria-label="History" variant="underlined" classNames={{ cursor: "w-full bg-primary", tabList: "p-0 border-b border-default-100", tabContent: "group-data-[selected=true]:text-primary font-medium" }}>
      <Tab key="positions" title={
        <div className="flex items-center gap-2">
          <span>Open Positions</span>
          <Chip size="sm" variant="flat" color="primary">{positions.length}</Chip>
        </div>
      }>
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
                  <th className="p-3 font-medium text-right">Entry Price</th>
                  <th className="p-3 font-medium text-right">Amount</th>
                  <th className="p-3 font-medium text-right">PnL (Est)</th>
                </tr>
              </thead>
              <tbody className="text-default-600">
                {positions.map((pos) => (
                  <tr key={pos.id} className="border-b border-default-50 dark:border-default-50/5 hover:bg-default-50 dark:hover:bg-default-50/5">
                    <td className="p-3">{pos.time}</td>
                    <td className="p-3 font-bold">{pos.symbol}</td>
                    <td className={`p-3 font-bold ${pos.side === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                      {pos.side.toUpperCase()}
                    </td>
                    <td className="p-3 text-right">{parseFloat(pos.price).toLocaleString()}</td>
                    <td className="p-3 text-right">{pos.amount}</td>
                    <td className={`p-3 text-right ${pos.pnl && pos.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {pos.pnl?.toFixed(2)} USDT
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Tab>
      <Tab key="history" title="Order History">
        <div className="p-0 overflow-auto h-[180px]">
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
              </tr>
            </thead>
            <tbody className="text-default-600">
              {/* Mock History Data */}
              <tr className="border-b border-default-50 dark:border-default-50/5 hover:bg-default-50 dark:hover:bg-default-50/5">
                <td className="p-3">12:45:30</td>
                <td className="p-3 font-bold">BTC/USDT</td>
                <td className="p-3">Limit</td>
                <td className="p-3 text-green-500">Buy</td>
                <td className="p-3 text-right">44,520.00</td>
                <td className="p-3 text-right">0.0250</td>
                <td className="p-3 text-right">1,113.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Tab>
    </Tabs>
  )
}
