"use client";

import { Card, CardBody, Avatar, Button, Chip } from "@heroui/react";
import { Trader } from "@/data/mock-traders";
import { TrendingUp, Users, ShieldCheck, Trophy } from "lucide-react";
import Link from "next/link";

interface TraderCardProps {
    trader: Trader;
    onCopy: (trader: Trader) => void;
}

export function TraderCard({ trader, onCopy }: TraderCardProps) {
    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow dark:bg-content1/50">
            <CardBody className="p-4">
                {/* Header: Avatar, Name, Badge */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3 items-center">
                        <Link href={`/dashboard/copy-trading/${trader.id}`}>
                            <Avatar
                                name={trader.avatar}
                                className="w-10 h-10 text-sm font-bold bg-gradient-to-br from-primary-500 to-secondary-500 text-white"
                            />
                        </Link>
                        <div>
                            <Link href={`/dashboard/copy-trading/${trader.id}`} className="font-bold text-sm hover:underline decoration-primary decoration-2 underline-offset-2">
                                {trader.name}
                            </Link>
                            <div className="flex gap-1 mt-0.5">
                                {trader.riskScore <= 3 ? (
                                    <Chip size="sm" variant="flat" color="success" className="h-4 px-1 text-[9px]">Low Risk</Chip>
                                ) : trader.riskScore <= 7 ? (
                                    <Chip size="sm" variant="flat" color="warning" className="h-4 px-1 text-[9px]">Moderate</Chip>
                                ) : (
                                    <Chip size="sm" variant="flat" color="danger" className="h-4 px-1 text-[9px]">High Volatility</Chip>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Rank Badge (Optional mock) */}
                    <div className="bg-default-100 dark:bg-default-50/50 p-1 rounded-full">
                        <Trophy size={14} className="text-yellow-500" />
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs mb-4">
                    <div>
                        <p className="text-default-500 text-[10px] mb-0.5">ROI (All Time)</p>
                        <p className={`text-base font-bold ${trader.roi >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {trader.roi >= 0 ? "+" : ""}{trader.roi}%
                        </p>
                    </div>
                    <div>
                        <p className="text-default-500 text-[10px] mb-0.5">Win Rate</p>
                        <p className="text-sm font-semibold text-default-900">{trader.winRate}%</p>
                    </div>
                    <div>
                        <p className="text-default-500 text-[10px] mb-0.5">Total P&L</p>
                        <p className={`font-medium ${trader.pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600"}`}>
                            ${trader.pnl.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-default-500 text-[10px] mb-0.5">Copiers</p>
                        <div className="flex items-center gap-1">
                            <Users size={12} className="text-default-400" />
                            <span className="font-medium text-default-700">{trader.copiers}</span>
                        </div>
                    </div>
                </div>

                {/* AUM Bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-default-500 mb-1">
                        <span>AUM</span>
                        <span>${(trader.aum / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="h-1 w-full bg-default-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min((trader.aum / 5000000) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <Button
                    className="w-full h-9 text-sm font-semibold shadow-sm shadow-default/20 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                    size="sm"
                    onPress={() => onCopy(trader)}
                >
                    Copy Trade
                </Button>
            </CardBody>
        </Card>
    );
}
