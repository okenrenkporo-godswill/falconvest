"use client";

import { Card, CardBody, CardHeader, Select, SelectItem, Input, Button, Avatar } from "@heroui/react";
import { ArrowRightLeft, Wallet } from "lucide-react";
import { useState } from "react";

const WALLETS = [
    { key: "main", label: "Main Wallet (Funding)" },
    { key: "trading", label: "Trading Wallet (Spot)" },
    { key: "mining", label: "Mining Wallet (Earn)" },
];

export function AssetTransfer() {
    const [fromWallet, setFromWallet] = useState("main");
    const [toWallet, setToWallet] = useState("trading");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSwap = () => {
        setFromWallet(toWallet);
        setToWallet(fromWallet);
    };

    const handleTransfer = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setAmount("");
            // Add toast success here
        }, 1500);
    };

    return (
        <Card className="border-none shadow-md dark:bg-zinc-900">
            <CardHeader className="flex gap-3 pb-0">
                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                    <ArrowRightLeft size={20} />
                </div>
                <div className="flex flex-col">
                    <p className="text-md font-bold">internal Transfer</p>
                    <p className="text-small text-default-500">Move funds between your wallets instantly</p>
                </div>
            </CardHeader>
            <CardBody className="p-6 gap-6">
                
                <div className="flex flex-col md:flex-row items-center gap-4">
                    {/* From */}
                    <div className="w-full">
                        <Select 
                            label="From" 
                            selectedKeys={[fromWallet]} 
                            onChange={(e) => setFromWallet(e.target.value)}
                            startContent={<Wallet size={16} className="text-default-400" />}
                        >
                            {WALLETS.map((w) => (
                                <SelectItem key={w.key}>{w.label}</SelectItem>
                            ))}
                        </Select>
                    </div>

                    {/* Swap Button */}
                    <Button isIconOnly variant="flat" className="rounded-full" onPress={handleSwap}>
                        <ArrowRightLeft size={16} />
                    </Button>

                    {/* To */}
                    <div className="w-full">
                        <Select 
                            label="To" 
                            selectedKeys={[toWallet]} 
                            onChange={(e) => setToWallet(e.target.value)}
                            startContent={<Wallet size={16} className="text-default-400" />}
                        >
                            {WALLETS.map((w) => (
                                <SelectItem key={w.key}>{w.label}</SelectItem>
                            ))}
                        </Select>
                    </div>
                </div>

                <div className="flex gap-4 items-end">
                    <Input 
                        label="Amount (USDT)" 
                        placeholder="0.00" 
                        variant="bordered"
                        value={amount}
                        onValueChange={setAmount}
                        endContent={
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-default-400">USDT</span>
                                <span className="h-4 w-[1px] bg-default-200"></span>
                                <button className="text-xs text-primary font-bold" onClick={() => setAmount("12500.00")}>MAX</button>
                            </div>
                        }
                    />
                </div>

                <div className="flex justify-between items-center text-xs text-default-500 px-1">
                    <span>Available: <span className="font-bold text-default-foreground">12,500.00 USDT</span></span>
                    <span>Fee: <span className="text-green-500">0.00 USDT</span></span>
                </div>

                <Button 
                    color="primary" 
                    className="w-full font-bold shadow-lg shadow-purple-500/20 bg-gradient-to-r from-blue-600 to-purple-600 border-none"
                    isLoading={loading}
                    onPress={handleTransfer}
                    isDisabled={!amount}
                >
                    Transfer Now
                </Button>

            </CardBody>
        </Card>
    );
}
