"use client";

import { Card, CardBody, Avatar, Button, Chip } from "@heroui/react";
import { Users, Trophy } from "lucide-react";
import Link from "next/link";

type Trader = {
    id: string;
    display_name: string;
    bio: string | null;
    avatar_url: string | null;
    total_followers: number;
    total_profit: number;
    win_rate: number;
    total_trades: number;
    risk_score: number | null;
    min_copy_amount: number;
};

interface TraderCardProps {
    trader: Trader;
    onCopy: (trader: Trader) => void;
}

export function TraderCard({ trader, onCopy }: TraderCardProps) {
    const riskScore = trader.risk_score || 5;

    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow dark:bg-content1/50">
            <CardBody className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3 items-center">
                        <Link href={`/dashboard/copy-trading/${trader.id}`}>
                            <Avatar
                                src={trader.avatar_url || undefined}
                                name={trader.display_name}
                                className="w-10 h-10 text-sm font-bold bg-gradient-to-br from-primary-500 to-secondary-500 text-white"
                            />
                        </Link>
                        <div className="min-w-0 flex-1">
                            <Link href={`/dashboard/copy-trading/${trader.id}`} className="font-bold text-sm hover:underline decoration-primary decoration-2 underline-offset-2 block truncate">
                                {trader.display_name}
                            </Link>
                            <div className="flex gap-1 mt-0.5">
                                {riskScore <= 3 ? (
                                    <Chip size="sm" variant="flat" color="success" className="h-4 px-1 text-[9px]">Low Risk</Chip>
                                ) : riskScore <= 7 ? (
                                    <Chip size="sm" variant="flat" color="warning" className="h-4 px-1 text-[9px]">Moderate</Chip>
                                ) : (
                                    <Chip size="sm" variant="flat" color="danger" className="h-4 px-1 text-[9px]">High Risk</Chip>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-default-100 dark:bg-default-50/50 p-1 rounded-full">
                        <Trophy size={14} className="text-yellow-500" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs mb-4">
                    <div>
                        <p className="text-default-500 text-[10px] mb-0.5">Total Profit</p>
                        <p className={`text-base font-bold ${trader.total_profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                            ${trader.total_profit.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-default-500 text-[10px] mb-0.5">Win Rate</p>
                        <p className="text-sm font-semibold text-default-900">{trader.win_rate}%</p>
                    </div>
                    <div>
                        <p className="text-default-500 text-[10px] mb-0.5">Total Trades</p>
                        <p className="font-medium text-default-700">{trader.total_trades}</p>
                    </div>
                    <div>
                        <p className="text-default-500 text-[10px] mb-0.5">Followers</p>
                        <div className="flex items-center gap-1">
                            <Users size={12} className="text-default-400" />
                            <span className="font-medium text-default-700">{trader.total_followers}</span>
                        </div>
                    </div>
                </div>

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
