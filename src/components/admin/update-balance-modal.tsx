"use client";

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Select,
    SelectItem,
    addToast,
    Chip,
} from "@heroui/react";
import { useState, useEffect } from "react";

import { getCryptoPrices } from "@/lib/crypto-prices";
import { useRouter } from "next/navigation";
import { adminUpdateBalance } from "@/actions/admin-copy-trades";

interface UpdateBalanceModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    userId: string;
    existingAssets?: string[]; // Optional: list of assets user already has
}

const COMMON_ASSETS = ["USDT", "BTC", "ETH", "USDC", "BNB", "XRP", "SOL", "ADA", "DOGE", "TRX"];

export function UpdateBalanceModal({
    isOpen,
    onOpenChange,
    userId,
    existingAssets = [],
}: UpdateBalanceModalProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [type, setType] = useState<"credit" | "debit">("credit");
    const [asset, setAsset] = useState("USDT");
    const [usdAmount, setUsdAmount] = useState("");
    const [accountType, setAccountType] = useState("trading");
    const [price, setPrice] = useState<number>(0);
    const [isLoadingPrice, setIsLoadingPrice] = useState(false);

    // Combine common assets with existing user assets
    const assetOptions = Array.from(new Set([...COMMON_ASSETS, ...existingAssets]));

    useEffect(() => {
        async function fetchPrice() {
            setIsLoadingPrice(true);
            const prices = await getCryptoPrices([asset]);
            setPrice(prices[asset] || 0);
            setIsLoadingPrice(false);
        }
        fetchPrice();
    }, [asset]);

    const assetAmount = price > 0 && usdAmount ? parseFloat(usdAmount) / price : 0;

    const handleSubmit = async () => {
        if (!usdAmount || parseFloat(usdAmount) <= 0) {
            addToast({ title: "Please enter a valid amount", color: "danger" });
            return;
        }

        if (price <= 0) {
            addToast({ title: "Failed to fetch price for conversion", color: "danger" });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await adminUpdateBalance({
                userId,
                asset,
                amount: assetAmount, // Send converted asset amount
                type,
                accountType: accountType as any,
            });

            if (result.error) {
                addToast({ title: result.error, color: "danger" });
            } else {
                addToast({ title: `Balance ${type === "credit" ? "credited" : "debited"} successfully`, color: "success" });
                onOpenChange();
                router.refresh();
                setUsdAmount(""); // Reset amount
            }
        } catch (error) {
            addToast({ title: "Failed to update balance", color: "danger" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>Update User Balance</ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Button
                                        className={`flex-1 ${type === "credit" ? "bg-success text-white" : "bg-default-100"}`}
                                        onPress={() => setType("credit")}
                                    >
                                        Credit (+)
                                    </Button>
                                    <Button
                                        className={`flex-1 ${type === "debit" ? "bg-danger text-white" : "bg-default-100"}`}
                                        onPress={() => setType("debit")}
                                    >
                                        Debit (-)
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Select
                                        label="Asset"
                                        selectedKeys={[asset]}
                                        onChange={(e) => setAsset(e.target.value)}
                                    >
                                        {assetOptions.map((a) => (
                                            <SelectItem key={a}>
                                                {a}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Select
                                        label="Account Type"
                                        selectedKeys={[accountType]}
                                        onChange={(e) => setAccountType(e.target.value)}
                                    >
                                        <SelectItem key="trading">Trading</SelectItem>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Input
                                        type="number"
                                        label="Amount (USD)"
                                        placeholder="0.00"
                                        value={usdAmount}
                                        onValueChange={setUsdAmount}
                                        startContent={<span className="text-default-400 text-sm">$</span>}
                                    />
                                    {price > 0 && (
                                        <div className="flex justify-between text-xs text-default-500 px-1">
                                            <span>Price: ${price.toLocaleString()}</span>
                                            <span>≈ {assetAmount.toFixed(8)} {asset}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button color={type === "credit" ? "success" : "danger"} onPress={handleSubmit} isLoading={isSubmitting}>
                                {type === "credit" ? "Credit Balance" : "Debit Balance"}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
