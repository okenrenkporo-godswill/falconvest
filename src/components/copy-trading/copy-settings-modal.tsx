"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, addToast } from "@heroui/react";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { startCopyTrading } from "@/actions/copy-trading";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AssetConverter } from "@/components/shared/asset-converter";

type Trader = {
  id: string;
  display_name: string;
  min_copy_amount: number;
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

export function CopySettingsModal({ isOpen, onOpenChange, trader }: CopySettingsModalProps) {
    const router = useRouter();
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [otherBalances, setOtherBalances] = useState<Balance[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchBalance();
        }
    }, [isOpen]);

    const fetchBalance = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            setLoading(false);
            return;
        }

        const { data: usdtData } = await supabase
            .from("balances")
            .select("amount")
            .eq("user_id", user.id)
            .eq("asset", "USDT")
            .eq("account_type", "trading")
            .maybeSingle();

        setBalance(usdtData?.amount || 0);

        const { data: allBalances } = await supabase
            .from("balances")
            .select("asset, amount")
            .eq("user_id", user.id)
            .eq("account_type", "trading")
            .neq("asset", "USDT")
            .gt("amount", 0);

        setOtherBalances(allBalances || []);
        setLoading(false);
    };

    if (!trader) return null;

    const handleCopy = async () => {
        if (!amount || parseFloat(amount) < trader.min_copy_amount) {
            addToast({
                title: "Error",
                description: `Minimum copy amount is $${trader.min_copy_amount}`,
                color: "danger",
            });
            return;
        }

        if (parseFloat(amount) > balance) {
            addToast({
                title: "Error",
                description: "Insufficient balance",
                color: "danger",
            });
            return;
        }

        setIsSubmitting(true);
        const result = await startCopyTrading({
            traderId: trader.id,
            copyAmount: parseFloat(amount),
        });
        setIsSubmitting(false);

        if (result.error) {
            addToast({
                title: "Error",
                description: result.error,
                color: "danger",
            });
        } else {
            addToast({
                title: "Success",
                description: `Started copying ${trader.display_name}`,
                color: "success",
            });
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
                                <div className="flex items-center justify-between p-3 bg-default-100 dark:bg-default-50/10 rounded-lg">
                                    <span className="text-sm text-default-500">USDT Balance (Trading)</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">
                                            {loading ? "..." : `$${balance.toLocaleString()}`}
                                        </span>
                                        <Link href="/dashboard/deposit?account=trading">
                                            <Button
                                                size="sm"
                                                color="primary"
                                                variant="flat"
                                                startContent={<Plus size={14} />}
                                            >
                                                Add USDT
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

                                <Input
                                    label="Copy Amount (USDT)"
                                    type="number"
                                    value={amount}
                                    onValueChange={setAmount}
                                    placeholder={`Min: $${trader.min_copy_amount}`}
                                    description={`Minimum: $${trader.min_copy_amount}`}
                                    startContent={<span className="text-default-400">$</span>}
                                    endContent={
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            className="min-w-12"
                                            onPress={() => setAmount(balance.toString())}
                                        >
                                            Max
                                        </Button>
                                    }
                                    isInvalid={amount ? parseFloat(amount) > balance || parseFloat(amount) < trader.min_copy_amount : false}
                                    errorMessage={
                                        amount && parseFloat(amount) > balance
                                            ? "Insufficient balance"
                                            : amount && parseFloat(amount) < trader.min_copy_amount
                                            ? `Minimum is $${trader.min_copy_amount}`
                                            : ""
                                    }
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleCopy}
                                isLoading={isSubmitting}
                            >
                                Start Copying
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
