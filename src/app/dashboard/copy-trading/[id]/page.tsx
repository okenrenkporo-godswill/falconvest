"use client";

import { use, useState } from "react";
import { MOCK_TRADERS, Trader } from "@/data/mock-traders";
import { Button, Card, CardBody, Avatar, Chip, Progress, Tabs, Tab } from "@heroui/react";
import { ArrowLeft, TrendingUp, Users, ShieldCheck, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { CopySettingsModal } from "@/components/copy-trading/copy-settings-modal";
import { notFound } from "next/navigation";

// Mock Positions Data
const MOCK_POSITIONS = [
    { symbol: "BTC/USDT", side: "Long", entry: 43500, mark: 44200, roe: 15.5, size: 0.5, leverage: 10 },
    { symbol: "ETH/USDT", side: "Short", entry: 2350, mark: 2310, roe: 8.2, size: 5.0, leverage: 5 },
    { symbol: "SOL/USDT", side: "Long", entry: 95.5, mark: 98.2, roe: 22.1, size: 50, leverage: 20 },
];

export default function TraderProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const trader = MOCK_TRADERS.find((t) => t.id === id);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!trader) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 p-4">
            {/* Back Navigation */}
            <Link href="/dashboard/copy-trading" className="inline-flex items-center text-sm text-default-500 hover:text-primary transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Back to Traders
            </Link>

            {/* Profile Header Card */}
            <Card className="border-none shadow-md bg-gradient-to-br from-default-50 to-default-100 dark:from-default-900/50 dark:to-default-900 overflow-visible">
                <CardBody className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                        <div className="flex gap-4 items-center">
                            <Avatar
                                name={trader.avatar}
                                className="w-20 h-20 text-3xl font-bold bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg"
                            />
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold">{trader.name}</h1>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {trader.tags.map(tag => (
                                        <Chip key={tag} size="sm" variant="flat" className="text-xs bg-background/60">{tag}</Chip>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button
                                className="w-full sm:w-auto font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black shadow-lg shadow-default/20"
                                size="lg"
                                onPress={() => setIsModalOpen(true)}
                            >
                                Copy Now
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 pt-6 border-t border-default-200/50">
                        <div>
                            <p className="text-default-500 text-xs uppercase font-bold mb-1">Total ROI</p>
                            <p className={`text-2xl font-bold ${trader.roi >= 0 ? "text-green-500" : "text-red-500"}`}>
                                {trader.roi >= 0 ? "+" : ""}{trader.roi}%
                            </p>
                        </div>
                        <div>
                            <p className="text-default-500 text-xs uppercase font-bold mb-1">Total P&L</p>
                            <p className={`text-2xl font-bold ${trader.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                                ${trader.pnl.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-default-500 text-xs uppercase font-bold mb-1">Win Rate</p>
                            <p className="text-2xl font-bold text-default-900">{trader.winRate}%</p>
                        </div>
                        <div>
                            <p className="text-default-500 text-xs uppercase font-bold mb-1">AUM</p>
                            <p className="text-2xl font-bold text-default-900">${(trader.aum / 1000000).toFixed(2)}M</p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Chart & Stats */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Chart Area */}
                    <Card className="border-none shadow-sm dark:bg-content1/50">
                        <CardBody className="p-6">
                            <h3 className="font-semibold text-lg mb-4">Performance Chart (30D)</h3>
                            {/* Simulated Chart Container */}
                            <div className="h-64 w-full bg-default-50/50 rounded-xl flex items-end justify-between px-2 pb-2 relative overflow-hidden">
                                {/* Simple SVG Line using mock data */}
                                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d={`M0,${256 - (trader.chartData[0] * 2)} ${trader.chartData.map((val, i) => `L${(i / (trader.chartData.length - 1)) * 100}%,${256 - (val * 2)}`).join(" ")} L100%,256 L0,256 Z`}
                                        fill="url(#gradient)"
                                    />
                                    <path
                                        d={`M0,${256 - (trader.chartData[0] * 2)} ${trader.chartData.map((val, i) => `L${(i / (trader.chartData.length - 1)) * 100}%,${256 - (val * 2)}`).join(" ")}`}
                                        fill="none"
                                        stroke="rgb(34, 197, 94)"
                                        strokeWidth="3"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </svg>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Positions Tabs */}
                    <Card className="border-none shadow-sm dark:bg-content1/50 min-h-[300px]">
                        <CardBody className="p-0">
                            <Tabs fullWidth size="lg" aria-label="Trader Data" variant="underlined" classNames={{ cursor: "w-full bg-primary", tabContent: "group-data-[selected=true]:text-primary" }}>
                                <Tab key="positions" title="Open Positions">
                                    <div className="p-4 space-y-3">
                                        {MOCK_POSITIONS.map((pos, i) => (
                                            <div key={i} className="flex flex-col sm:flex-row justify-between items-center p-3 rounded-lg hover:bg-default-50 dark:hover:bg-default-100/5 transition-colors border border-transparent hover:border-default-100">
                                                <div className="flex gap-4 items-center w-full sm:w-auto">
                                                    <div className={`w-1 h-12 rounded-full ${pos.side === 'Long' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    <div>
                                                        <p className="font-bold">{pos.symbol}</p>
                                                        <div className="flex gap-2 text-xs">
                                                            <span className={`${pos.side === 'Long' ? 'text-green-500' : 'text-red-500'} font-medium`}>{pos.side} {pos.leverage}x</span>
                                                            <span className="text-default-400">| Size: {pos.size}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right w-full sm:w-auto mt-2 sm:mt-0 flex justify-between sm:block">
                                                    <span className="sm:hidden text-sm text-default-500">ROE</span>
                                                    <div>
                                                        <p className={`font-bold ${pos.roe >= 0 ? "text-green-500" : "text-red-500"}`}>{pos.roe >= 0 ? "+" : ""}{pos.roe}%</p>
                                                        <p className="text-xs text-default-400">Entry: {pos.entry}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Tab>
                                <Tab key="history" title="History">
                                    <div className="p-8 text-center text-default-400 text-sm">
                                        <Clock size={24} className="mx-auto mb-2 opacity-50" />
                                        Recent history is hidden by trader.
                                    </div>
                                </Tab>
                                <Tab key="copiers" title="Copiers">
                                    <div className="p-8 text-center text-default-400 text-sm">
                                        <Users size={24} className="mx-auto mb-2 opacity-50" />
                                        {trader.copiers} active copiers
                                    </div>
                                </Tab>
                            </Tabs>
                        </CardBody>
                    </Card>

                </div>

                {/* Right Column: Detailed Metrics */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm dark:bg-content1/50">
                        <CardBody className="p-5 space-y-6">
                            <h3 className="font-semibold text-lg">Detailed Stats</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-default-500">Max Drawdown</span>
                                    <span className="font-medium">{trader.maxDrawdown}%</span>
                                </div>
                                <Progress value={trader.maxDrawdown} color="danger" size="sm" className="h-1" />

                                <div className="flex justify-between items-center text-sm pt-2">
                                    <div className="flex items-center gap-1.5">
                                        <ShieldCheck size={16} className="text-orange-500" />
                                        <span className="text-default-500">Risk Score</span>
                                    </div>
                                    <span className="font-medium">{trader.riskScore}/10</span>
                                </div>
                                <Progress value={trader.riskScore * 10} color="warning" size="sm" className="h-1" />

                                <div className="flex justify-between items-center text-sm pt-2">
                                    <span className="text-default-500">Avg. Holding Time</span>
                                    <span className="font-medium">3 Days</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-default-500">Weekly Trades</span>
                                    <span className="font-medium">12.5</span>
                                </div>
                            </div>

                            <div className="bg-default-100 dark:bg-default-50/50 p-4 rounded-xl text-xs text-default-500 leading-relaxed">
                                <p className="font-semibold text-default-700 mb-1">Strategy Description</p>
                                {trader.description}
                            </div>

                        </CardBody>
                    </Card>
                </div>
            </div>

            <CopySettingsModal
                isOpen={isModalOpen}
                onOpenChange={() => setIsModalOpen(false)}
                trader={trader ? {
                    id: trader.id,
                    display_name: trader.name,
                    min_copy_amount: 100,
                    total_profit: trader.pnl,
                    win_rate: trader.winRate
                } : null}
            />
        </div>
    );
}
