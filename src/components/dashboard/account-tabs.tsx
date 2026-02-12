"use client";

import { useTradingStore } from "@/lib/store/trading-store";
import { Button, Card, CardBody, useDisclosure } from "@heroui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { TransferModal } from "@/components/account/transfer-modal";
// ... existing imports

interface Balance {
    id: string;
    asset: string;
    amount: number;
    account_type: string;
    logo_url?: string;
}

interface AccountTabsProps {
    totalBalance: number;
    balances: Balance[] | null;
}

export function AccountTabs({ totalBalance, balances }: AccountTabsProps) {
    const [activeTab, setActiveTab] = useState<'account' | 'asset'>('asset');
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    // Zustand hydration safe handling
    const positions = useTradingStore((state) => state.positions);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const hasAssets = (balances && balances.length > 0) || (isMounted && positions.length > 0);

    return (
        <>
        <Card className="bg-transparent shadow-none border-none" shadow="none">
            <CardBody className="p-0">
                {/* Custom Tab Buttons */}
                <div className="flex border-b border-default-200">
                    <button
                        onClick={() => setActiveTab('asset')}
                        className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base font-medium transition-colors relative ${activeTab === 'asset'
                            ? 'text-red-600'
                            : 'text-default-600 hover:text-default-900'
                            }`}
                    >
                        Assets
                        {activeTab === 'asset' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base font-medium transition-colors relative ${activeTab === 'account'
                            ? 'text-red-600'
                            : 'text-default-600 hover:text-default-900'
                            }`}
                    >
                        Account
                        {activeTab === 'account' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
                        )}
                    </button>

                </div>

                {/* Tab Content */}
                {activeTab === 'asset' && (
                    <div className="p-4 sm:p-6 space-y-6">
                        {hasAssets && balances && balances.length > 1 && (
                            <Button
                                size="sm"
                                variant="flat"
                                color="primary"
                                startContent={<ArrowRightLeft size={16} />}
                                onPress={onOpen}
                                className="w-full sm:w-auto"
                            >
                                Transfer Between Accounts
                            </Button>
                        )}
                        
                        {hasAssets ? (
                            <>
                                {/* Open Trades Section */}
                                {isMounted && positions.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-default-500">Open Trades</h4>
                                        <div className="space-y-2">
                                            {positions.map((pos) => (
                                                <div key={pos.id} className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-50/5 border border-default-100 dark:border-default-50/10">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-sm">{pos.pair}</span>
                                                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${pos.side === 'long' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                                {pos.side.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-default-400">{new Date(pos.opened_at).toLocaleString()}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-sm font-semibold ${pos.unrealized_pnl && pos.unrealized_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {pos.unrealized_pnl ? (pos.unrealized_pnl > 0 ? '+' : '') + pos.unrealized_pnl.toFixed(2) : '0.00'} USDT
                                                        </p>
                                                        <p className="text-xs text-default-500">{pos.amount} {pos.pair.split('/')[0]}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Balances Section */}
                                {balances && balances.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-default-500">Wallet Balances</h4>
                                        <div className="space-y-2">
                                            {balances.map((balance) => (
                                                <div key={balance.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-default-50 transition-colors">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-default-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                                                            {balance.logo_url ? (
                                                                <img 
                                                                    src={balance.logo_url} 
                                                                    alt={balance.asset} 
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-xs font-bold text-default-600">
                                                                    {balance.asset?.substring(0, 2).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm sm:text-base font-medium">{balance.asset}</p>
                                                            <p className="text-xs text-default-500 capitalize">{balance.account_type} Account</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm sm:text-base font-semibold">${Number(balance.amount).toFixed(2)}</p>
                                                        <p className="text-xs text-default-500">{Number(balance.amount).toFixed(8)} {balance.asset}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-6 sm:py-8 text-default-500">
                                <p className="text-sm mb-2">No assets or open trades yet</p>
                                <Link href="/dashboard/deposit">
                                    <Button className="font-bold bg-zinc-900 bg-red-500 text-white hover:bg-red-600" size="sm">Deposit Funds</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'account' && (
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-default-600">Total Balance</span>
                            <span className="text-sm sm:text-base font-semibold">${totalBalance.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-default-600">Available</span>
                            <span className="text-sm sm:text-base font-semibold">${totalBalance.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-default-600">In Use</span>
                            <span className="text-sm sm:text-base font-semibold">$0.00</span>
                        </div>
                    </div>
                )}


            </CardBody>
        </Card>

        {balances && <TransferModal isOpen={isOpen} onOpenChange={onOpenChange} balances={balances} />}
        </>
    );
}
