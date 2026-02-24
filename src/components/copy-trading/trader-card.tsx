"use client";

import { Card, CardBody, Avatar, Button, Chip } from "@heroui/react";
import { Users } from "lucide-react";
import Link from "next/link";

// Twitter/X Verified Badge SVG
function VerifiedBadge({ size = 18 }: { size?: number }) {
    return (
        <svg viewBox="0 0 22 22" width={size} height={size} aria-label="Verified account" className="flex-shrink-0">
            <path
                d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.855-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.143.271.586.702 1.084 1.24 1.438.54.354 1.167.551 1.813.569.646-.018 1.273-.215 1.813-.569.54-.354.969-.853 1.24-1.438.608.226 1.267.276 1.902.143.635-.13 1.22-.437 1.69-.883.445-.469.749-1.054.878-1.69.13-.633.08-1.29-.144-1.896.587-.274 1.084-.705 1.438-1.245.354-.54.551-1.17.569-1.817z"
                fill="#1D9BF0"
            />
            <path
                d="M9.585 14.929l-3.28-3.28 1.168-1.168 2.112 2.112 5.036-5.036 1.168 1.168z"
                fill="white"
            />
        </svg>
    );
}


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
                    <VerifiedBadge size={18} />
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
