"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Slider } from "@heroui/react";
import { Trader } from "@/data/mock-traders";
import { useState } from "react";
import { Wallet, ShieldAlert, TrendingUp } from "lucide-react";
import { useTradingStore } from "@/lib/store/trading-store";

interface CopySettingsModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    trader: Trader | null;
}

export function CopySettingsModal({ isOpen, onOpenChange, trader }: CopySettingsModalProps) {
    const addPosition = useTradingStore((state) => state.addPosition);
    const [amount, setAmount] = useState("");
    const [stopLoss, setStopLoss] = useState(10); // Percentage
    const [takeProfit, setTakeProfit] = useState(20); // Percentage
    const [leverage, setLeverage] = useState(1);

    if (!trader) return null;

    const handleCopy = () => {
        if (!trader || !amount) return;

        // Create a new position representing the copied trade
        addPosition({
            id: Math.random().toString(36).substr(2, 9),
            symbol: `COPY: ${trader.name}`,
            side: "buy", // standardized as a 'long' investment in the trader
            type: "market",
            price: "ENTRY",
            amount: amount,
            total: amount,
            time: new Date().toLocaleTimeString(),
            pnl: 0
        });

        onOpenChange();
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold">Copy Trade {trader.name}</h2>
                            <div className="flex gap-4 text-sm text-default-500">
                                <span className="flex items-center gap-1"><TrendingUp size={14} className="text-green-500" /> ROI: {trader.roi}%</span>
                                <span className="flex items-center gap-1"><ShieldAlert size={14} className="text-orange-500" /> Risk: {trader.riskScore}/10</span>
                            </div>
                        </ModalHeader>
                        <ModalBody className="gap-6">

                            {/* Investment Amount */}
                            <div>
                                <Input
                                    label="Investment Amount (USDT)"
                                    placeholder="Min 50 USDT"
                                    value={amount}
                                    onValueChange={setAmount}
                                    startContent={<Wallet size={18} className="text-default-400" />}
                                    type="number"
                                    description="Available Balance: $12,500.50"
                                />
                            </div>

                            {/* Leverage Slider */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Leverage (Optional)</label>
                                <Slider
                                    aria-label="Leverage"
                                    step={1}
                                    maxValue={10}
                                    minValue={1}
                                    defaultValue={1}
                                    value={leverage}
                                    onChange={(value) => setLeverage(value as number)}
                                    showSteps={true}

                                    className="max-w-md"
                                // renderValue={({children, ...props}) => (
                                //     <output {...props}>
                                //         {leverage}x
                                //     </output>
                                // )}
                                />
                                <div className="flex justify-between text-xs text-default-400 mt-1">
                                    <span>1x (Safe)</span>
                                    <span className="font-bold text-primary">{leverage}x</span>
                                    <span>10x (High Risk)</span>
                                </div>
                            </div>

                            {/* Risk Management */}
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Stop Loss (%)"
                                    placeholder="e.g. 10"
                                    value={stopLoss.toString()}
                                    onValueChange={(v) => setStopLoss(Number(v))}
                                    endContent={<span className="text-default-400">%</span>}
                                    type="number"
                                />
                                <Input
                                    label="Take Profit (%)"
                                    placeholder="e.g. 20"
                                    value={takeProfit.toString()}
                                    onValueChange={(v) => setTakeProfit(Number(v))}
                                    endContent={<span className="text-default-400">%</span>}
                                    type="number"
                                />
                            </div>

                            <div className="bg-default-100 dark:bg-default-50/50 p-3 rounded-lg text-xs text-default-500">
                                Warning: Copy trading involves risk. Past performance is not indicative of future results.
                                Ensure you understand the risks before proceeding with high leverage.
                            </div>

                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button
                                className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-semibold"
                                onPress={handleCopy}
                                isDisabled={!amount || Number(amount) < 10}
                            >
                                Confirm Copy
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
