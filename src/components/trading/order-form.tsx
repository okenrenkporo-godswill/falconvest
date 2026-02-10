"use client";

import { Card, CardBody, Tabs, Tab, Input, Button, Slider, Divider } from "@heroui/react";
import { useState } from "react";
import { Wallet } from "lucide-react";

interface OrderFormProps {
    symbol: string;
    onOrder: (order: any) => void;
}

export function OrderForm({ symbol, onOrder }: OrderFormProps) {
    const [side, setSide] = useState<"buy" | "sell">("buy");
    const [orderType, setOrderType] = useState<"limit" | "market">("limit");
    const [price, setPrice] = useState("45000");
    const [amount, setAmount] = useState("");
    const [sliderValue, setSliderValue] = useState(0);

    const baseAsset = symbol.replace("USDT", ""); // e.g., BTC, ETH
    const balance = side === "buy" ? 12500.50 : 0.45; // Mock: USDT vs Crypto
    const balanceSymbol = side === "buy" ? "USDT" : baseAsset;

    const handleSliderChange = (val: number | number[]) => {
        const v = Array.isArray(val) ? val[0] : val;
        setSliderValue(v);
        // Mock calculation
        if (side === "buy" && price) {
            const max = balance / parseFloat(price);
            setAmount((max * (v / 100)).toFixed(5));
        } else {
            setAmount((balance * (v / 100)).toFixed(5));
        }
    };

    const handleSubmit = () => {
        if (!amount) return;

        onOrder({
            side,
            type: orderType,
            price: orderType === 'market' ? 'Market' : price,
            amount,
            total: (parseFloat(price) * parseFloat(amount)).toFixed(2)
        });

        // Reset
        setAmount("");
        setSliderValue(0);
    };

    const total = parseFloat(price || "0") * parseFloat(amount || "0");

    return (
        <Card className="border-none shadow-sm dark:bg-zinc-900 h-full">
            <CardBody className="p-4 gap-4">
                {/* Buy / Sell Tabs */}
                <div className="flex bg-default-100 dark:bg-black/20 p-1 rounded-lg">
                    <button
                        onClick={() => setSide("buy")}
                        className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${side === "buy" ? "bg-green-500 text-white shadow-sm" : "text-default-500 hover:text-default-700"}`}
                    >
                        Buy
                    </button>
                    <button
                        onClick={() => setSide("sell")}
                        className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${side === "sell" ? "bg-red-500 text-white shadow-sm" : "text-default-500 hover:text-default-700"}`}
                    >
                        Sell
                    </button>
                </div>

                {/* Order Type Tabs */}
                <div className="flex gap-4 text-sm font-medium border-b border-default-200 dark:border-default-100/10 pb-2">
                    <button
                        onClick={() => setOrderType("limit")}
                        className={`pb-1 border-b-2 transition-colors ${orderType === "limit" ? "border-primary text-primary" : "border-transparent text-default-500"}`}
                    >
                        Limit
                    </button>
                    <button
                        onClick={() => setOrderType("market")}
                        className={`pb-1 border-b-2 transition-colors ${orderType === "market" ? "border-primary text-primary" : "border-transparent text-default-500"}`}
                    >
                        Market
                    </button>
                </div>

                {/* Inputs */}
                <div className="space-y-3">
                    {orderType === "limit" && (
                        <Input
                            label="Price (USDT)"
                            placeholder="0.00"
                            labelPlacement="inside"
                            size="lg"
                            value={price}
                            onValueChange={setPrice}
                            variant="flat"
                            classNames={{ input: "font-mono" }}
                        />
                    )}
                    {orderType === "market" && (
                        <div className="bg-default-100 dark:bg-default-50/10 p-4 rounded-xl text-center text-sm text-default-500 font-medium h-14 content-center">
                            Market Price
                        </div>
                    )}

                    <Input
                        label={`Amount (${baseAsset})`}
                        placeholder="0.00"
                        labelPlacement="inside"
                        size="lg"
                        value={amount}
                        onValueChange={setAmount}
                        variant="flat"
                        classNames={{ input: "font-mono" }}
                    />

                    {/* Percentage Slider */}
                    <Slider
                        aria-label="Percentage"
                        size="sm"
                        step={25}
                        showSteps={true}
                        maxValue={100}
                        minValue={0}
                        defaultValue={0}
                        value={sliderValue}
                        onChange={handleSliderChange}
                        color={side === "buy" ? "success" : "danger"}
                        className="max-w-md"
                    />

                    <div className="flex justify-between text-xs text-default-400">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                    </div>
                </div>

                <Divider className="my-2" />

                {/* Summary & Balance */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-default-500">
                        <span>Avail. Balance</span>
                        <div className="flex items-center gap-1">
                            <Wallet size={12} />
                            <span>{balance.toLocaleString()} {balanceSymbol}</span>
                        </div>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                        <span>Total (USDT)</span>
                        <span>{total ? total.toFixed(2) : "0.00"}</span>
                    </div>
                </div>

                {/* Action Button */}
                <Button
                    size="lg"
                    isDisabled={!amount || parseFloat(amount) <= 0}
                    className={`w-full font-bold text-white shadow-lg ${side === "buy" ? "bg-green-500 shadow-green-500/20" : "bg-red-500 shadow-red-500/20"}`}
                    onPress={() => {
                        console.log("Button Pressed. Amount:", amount);
                        handleSubmit();
                    }}
                >
                    {side === "buy" ? `Buy ${baseAsset}` : `Sell ${baseAsset}`}
                </Button>

            </CardBody>
        </Card>
    );
}
