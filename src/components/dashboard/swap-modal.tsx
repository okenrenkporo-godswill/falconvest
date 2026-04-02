"use client";

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Select,
    SelectItem,
    Input,
    addToast,
} from "@heroui/react";
import { useState, useMemo, useEffect } from "react";
import { ArrowRightLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Balance {
    id: string;
    asset: string;
    amount: number;
    account_type: string;
    logo_url?: string;
    usd_value?: number;
}

interface SwapModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    balances: Balance[] | null;
}

const COINGECKO_IDS: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'BNB': 'binancecoin',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
};

export function SwapModal({ isOpen, onOpenChange, balances }: SwapModalProps) {
    const router = useRouter();
    const [fromAsset, setFromAsset] = useState("");
    const [toAsset, setToAsset] = useState("");
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [conversionRate, setConversionRate] = useState(1);
    const [loadingRate, setLoadingRate] = useState(false);

    // Available assets for "From" selection (only where balance > 0)
    const availableAssets = useMemo(() => {
        return balances?.filter(b => b.amount > 0).map(b => b.asset) || [];
    }, [balances]);

    // All supported assets for "To" selection
    const supportedAssets = Object.keys(COINGECKO_IDS);

    // Get available balance for selected "From" asset
    const availableBalance = useMemo(() => {
        const balance = balances?.find(b => b.asset === fromAsset);
        return balance?.amount || 0;
    }, [balances, fromAsset]);

    // Fetch conversion rate when assets change
    useEffect(() => {
        if (fromAsset && toAsset && fromAsset !== toAsset && isOpen) {
            fetchConversionRate(fromAsset, toAsset);
        }
    }, [fromAsset, toAsset, isOpen]);

    const fetchConversionRate = async (from: string, to: string) => {
        setLoadingRate(true);
        try {
            const fromCoinId = COINGECKO_IDS[from] || from.toLowerCase();
            const toCoinId = COINGECKO_IDS[to] || to.toLowerCase();

            const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${fromCoinId},${toCoinId}&vs_currencies=usd`
            );
            const data = await response.json();

            const getRate = (id: string, symbol: string) => {
                if (['USDT', 'USDC', 'DAI', 'BUSD'].includes(symbol.toUpperCase())) return 1;
                return data[id]?.usd || 1;
            };

            const fromRate = getRate(fromCoinId, from);
            const toRate = getRate(toCoinId, to);

            setConversionRate(fromRate / toRate);
        } catch (error) {
            console.error("Failed to fetch rate", error);
        } finally {
            setLoadingRate(false);
        }
    };

    const handleMax = () => setAmount(availableBalance.toString());

    const handleSubmit = async () => {
        if (!fromAsset || !toAsset || !amount || parseFloat(amount) <= 0) {
            addToast({ title: "Please fill all fields correctly", color: "danger" });
            return;
        }

        if (parseFloat(amount) > availableBalance) {
            addToast({ title: "Insufficient balance", color: "danger" });
            return;
        }

        setIsSubmitting(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setIsSubmitting(false);
            return;
        }

        try {
            // Use the atomic swap RPC
            const { data, error } = await supabase.rpc("swap_assets", {
                p_user_id: user.id,
                p_from_asset: fromAsset,
                p_to_asset: toAsset,
                p_amount: parseFloat(amount),
                p_conversion_rate: conversionRate,
                p_account_type: balances?.find(b => b.asset === fromAsset)?.account_type || "trading",
            });
            
            if (error || !data?.success) {
                addToast({ 
                    title: "Swap Failed", 
                    description: error?.message || data?.error || "Transaction error", 
                    color: "danger" 
                });
                return;
            }

            addToast({
                title: "Swap Successful",
                description: data.message,
                color: "success",
            });

            setAmount("");
            setFromAsset("");
            setToAsset("");
            router.refresh();
            onOpenChange();
        } catch (error: any) {
            addToast({ title: error.message || "Swap failed", color: "danger" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const estimatedOutput = amount ? (parseFloat(amount) * conversionRate).toFixed(6) : "0.00";

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex items-center gap-2">
                            <ArrowRightLeft size={20} />
                            Swap Assets
                        </ModalHeader>
                        <ModalBody className="space-y-4">
                            <Select
                                label="From Asset"
                                placeholder="Select asset to swap"
                                selectedKeys={fromAsset ? [fromAsset] : []}
                                onChange={(e) => setFromAsset(e.target.value)}
                            >
                                {availableAssets.map((asset) => (
                                    <SelectItem key={asset} textValue={asset}>
                                        {asset}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Select
                                label="To Asset"
                                placeholder="Select asset to receive"
                                selectedKeys={toAsset ? [toAsset] : []}
                                onChange={(e) => setToAsset(e.target.value)}
                                isDisabled={!fromAsset}
                            >
                                {supportedAssets.filter(a => a !== fromAsset).map((asset) => (
                                    <SelectItem key={asset} textValue={asset}>
                                        {asset}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Input
                                type="number"
                                label="Amount"
                                placeholder="0.00"
                                value={amount}
                                onValueChange={setAmount}
                                description={
                                    <div className="flex justify-between w-full text-xs">
                                        <span>Available: {availableBalance.toFixed(8)} {fromAsset}</span>
                                        {fromAsset && toAsset && (
                                            <span>Rate: 1 {fromAsset} ≈ {conversionRate.toFixed(4)} {toAsset}</span>
                                        )}
                                    </div>
                                }
                                endContent={
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color="primary"
                                        className="h-6 min-w-unit-12 px-2 text-xs"
                                        onPress={handleMax}
                                        isDisabled={!fromAsset}
                                    >
                                        MAX
                                    </Button>
                                }
                            />

                            {fromAsset && toAsset && amount && (
                                <div className="bg-default-100 p-3 rounded-lg flex justify-between items-center">
                                    <span className="text-sm text-default-500">You Receive</span>
                                    <span className="text-lg font-bold text-success">
                                        {loadingRate ? "..." : `≈ ${estimatedOutput} ${toAsset}`}
                                    </span>
                                </div>
                            )}

                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button
                                className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                                onPress={handleSubmit}
                                isLoading={isSubmitting}
                                isDisabled={!fromAsset || !toAsset || !amount || parseFloat(amount) <= 0 || loadingRate}
                            >
                                Swap Assets
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
