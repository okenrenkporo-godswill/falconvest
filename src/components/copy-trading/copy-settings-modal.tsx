"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, addToast } from "@heroui/react";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { startCopyTrading } from "@/actions/copy-trading";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AssetConverter } from "@/components/shared/asset-converter";

// Fallback BTC/USD rate to match home screen (~$60,385)
const DEFAULT_BTC_USD_RATE = 60385;

type Trader = {
  id: string;
  display_name: string;
  min_copy_amount: number; // stored in USD
  total_profit: number;
  win_rate: number;
};

interface CopySettingsModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    trader: Trader | null;
}

type Balance = {
    asset: string;
    amount: number;
};

const SUPPORTED_ASSETS = ["USDT", "BTC"] as const;
type SupportedAsset = typeof SUPPORTED_ASSETS[number];

export function CopySettingsModal({ isOpen, onOpenChange, trader }: CopySettingsModalProps) {
    const router = useRouter();
    const [amount, setAmount] = useState("");
    const [selectedAsset, setSelectedAsset] = useState<SupportedAsset>("USDT");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [balances, setBalances] = useState<Record<SupportedAsset, number>>({ USDT: 0, BTC: 0 });
    const [loading, setLoading] = useState(true);
    const [otherBalances, setOtherBalances] = useState<Balance[]>([]);
    const [btcPrice, setBtcPrice] = useState<number>(DEFAULT_BTC_USD_RATE);

    useEffect(() => {
        if (isOpen) {
            fetchBalance();
            fetchBtcPriceSilently();
        }
    }, [isOpen]);

    useEffect(() => {
        setAmount("");
    }, [selectedAsset]);

    const fetchBtcPriceSilently = async () => {
        try {
            const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd", { cache: "no-store" });
            if (res.ok) {
                const json = await res.json();
                if (json?.bitcoin?.usd) {
                    setBtcPrice(json.bitcoin.usd);
                }
            }
        } catch (err) {
            console.error("Failed to silently fetch live BTC price, using fallback:", err);
        }
    };

    const fetchBalance = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) { setLoading(false); return; }

        const { data: allBalances } = await supabase
            .from("balances")
            .select("asset, amount")
            .eq("user_id", user.id)
            .eq("account_type", "trading")
            .gt("amount", 0);

        const newBalances: Record<SupportedAsset, number> = { USDT: 0, BTC: 0 };
        const otherList: Balance[] = [];

        (allBalances || []).forEach((b) => {
            if (b.asset === "USDT") newBalances.USDT = b.amount;
            else if (b.asset === "BTC") newBalances.BTC = b.amount;
            else otherList.push(b);
        });

        setBalances(newBalances);
        setOtherBalances(otherList);
        setLoading(false);
    };

    if (!trader) return null;

    const parsedAmount = parseFloat(amount) || 0;

    // USD-equivalent of the selected asset's balance
    const usdBalance =
        selectedAsset === "BTC"
            ? balances.BTC * btcPrice
            : balances.USDT;

    const balanceLabel = loading
        ? "..."
        : selectedAsset === "BTC"
            ? `$${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (≈ ${balances.BTC.toFixed(8)} BTC)`
            : `$${balances.USDT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const handleCopy = async () => {
        if (!amount || parsedAmount < trader.min_copy_amount) {
            addToast({
                title: "Error",
                description: `Minimum copy amount is $${trader.min_copy_amount.toLocaleString()}`,
                color: "danger",
            });
            return;
        }

        if (parsedAmount > usdBalance) {
            addToast({ title: "Error", description: "Insufficient balance", color: "danger" });
            return;
        }

        // Convert USD → BTC units when paying with BTC
        const copyAmount = selectedAsset === "BTC"
            ? parsedAmount / btcPrice
            : parsedAmount;

        setIsSubmitting(true);
        const result = await startCopyTrading({
            traderId: trader.id,
            copyAmount,
            asset: selectedAsset,
        });
        setIsSubmitting(false);

        if (result.error) {
            addToast({
                title: "Cannot Start Copy Trading",
                description: result.suggestion ? `${result.error}. ${result.suggestion}` : result.error,
                color: "danger",
            });
        } else {
            addToast({ title: "Success", description: `Started copying ${trader.display_name}`, color: "success" });
            onOpenChange();
            setAmount("");
            router.push("/dashboard/my-copy-trades");
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold">Copy {trader.display_name}</h2>
                            <div className="flex gap-4 text-sm text-default-500">
                                <span>Profit: ${trader.total_profit.toLocaleString()}</span>
                                <span>Win Rate: {trader.win_rate}%</span>
                            </div>
                        </ModalHeader>

                        <ModalBody>
                            <div className="space-y-4">
                                {/* Asset Selector */}
                                <div>
                                    <p className="text-sm text-default-500 mb-2">Pay with</p>
                                    <div className="flex gap-2">
                                        {SUPPORTED_ASSETS.map((asset) => (
                                            <Button
                                                key={asset}
                                                size="sm"
                                                variant={selectedAsset === asset ? "solid" : "bordered"}
                                                color={selectedAsset === asset ? "primary" : "default"}
                                                onPress={() => setSelectedAsset(asset)}
                                                className="min-w-16"
                                            >
                                                {asset}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Balance — always in USD */}
                                <div className="flex items-center justify-between p-3 bg-default-100 dark:bg-default-50/10 rounded-lg">
                                    <span className="text-sm text-default-500">{selectedAsset} Balance (Trading)</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">{balanceLabel}</span>
                                        <Link href="/dashboard/deposit?account=trading">
                                            <Button size="sm" color="primary" variant="flat" startContent={<Plus size={14} />}>
                                                Add {selectedAsset}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>

                                <AssetConverter
                                    targetAsset="USDT"
                                    accountType="trading"
                                    otherBalances={otherBalances}
                                    onConversionComplete={fetchBalance}
                                />

                                {/* Amount — always in USD, $ symbol */}
                                <Input
                                    label="Copy Amount (USD)"
                                    type="number"
                                    value={amount}
                                    onValueChange={setAmount}
                                    placeholder={`Min: $${trader.min_copy_amount}`}
                                    description={
                                        selectedAsset === "BTC" && parsedAmount > 0
                                            ? `≈ ${(parsedAmount / btcPrice).toFixed(8)} BTC will be debited`
                                            : `Minimum: $${trader.min_copy_amount.toLocaleString()}`
                                    }
                                    startContent={<span className="text-default-400">$</span>}
                                    endContent={
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            className="min-w-12"
                                            onPress={() => setAmount(usdBalance.toFixed(2))}
                                        >
                                            Max
                                        </Button>
                                    }
                                    isInvalid={
                                        !!amount
                                            ? parsedAmount > usdBalance || parsedAmount < trader.min_copy_amount
                                            : false
                                    }
                                    errorMessage={
                                        amount && parsedAmount > usdBalance
                                            ? "Insufficient balance"
                                            : amount && parsedAmount < trader.min_copy_amount
                                            ? `Minimum is $${trader.min_copy_amount.toLocaleString()}`
                                            : ""
                                    }
                                />
                            </div>
                        </ModalBody>

                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>Cancel</Button>
                            <Button color="primary" onPress={handleCopy} isLoading={isSubmitting}>
                                Start Copying
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
