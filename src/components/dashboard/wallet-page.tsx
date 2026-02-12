"use client";

import { Card, CardBody, Button } from "@heroui/react";
import { ArrowDownCircle } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface WalletPageProps {
    title: string;
    description: string;
    balance: number;
    walletType: "holdings" | "staking" | "trading";
    isLoading?: boolean;
}

export function WalletPage({ title, description, balance, walletType, isLoading = false }: WalletPageProps) {
    // Format balance
    const formattedBalance = useMemo(() => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(balance);
    }, [balance]);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6 pt-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <p className="text-default-500">{description}</p>
                </div>
                <Card className="border-none shadow-md bg-gradient-to-br from-zinc-900 to-zinc-800 text-white dark:from-zinc-800 dark:to-zinc-900">
                    <CardBody className="p-8">
                        <p className="text-zinc-400 font-medium mb-1">Total Balance</p>
                        <div className="h-10 w-32 bg-zinc-700 animate-pulse rounded mb-6" />
                        <div className="h-10 w-28 bg-zinc-700 animate-pulse rounded" />
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pt-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-default-500">{description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-md bg-gradient-to-br from-zinc-900 to-zinc-800 text-white dark:from-zinc-800 dark:to-zinc-900">
                    <CardBody className="p-8">
                        <p className="text-zinc-400 font-medium mb-1">Total Balance</p>
                        <h2 className="text-4xl font-bold mb-6">{formattedBalance}</h2>
                        <div className="flex gap-4">
                            <Button
                                as={Link}
                                href={`/dashboard/deposit?wallet=${walletType}`}
                                className="bg-white text-black font-bold"
                                startContent={<ArrowDownCircle size={18} />}
                            >
                                Add Funds
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* Optional Chart or secondary info card could go here */}
                <Card className="border-none shadow-sm dark:bg-zinc-900/50">
                    <CardBody className="p-8 flex items-center justify-center text-center">
                        <div className="space-y-2">
                            <p className="font-semibold text-lg">Activity</p>
                            <p className="text-default-500 text-sm">No recent transactions in this wallet.</p>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
