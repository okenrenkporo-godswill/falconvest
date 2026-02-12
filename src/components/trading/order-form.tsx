"use client";

import { Card, CardBody, Tabs, Tab, Input, Button, Slider, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Spinner, Progress } from "@heroui/react";
import { useState, useEffect } from "react";
import { Wallet, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface OrderFormProps {
    symbol: string;
    onOrder: (order: { side: "buy" | "sell"; amount: number; price: number }) => Promise<{ success?: boolean; error?: string }>;
    balance: number;
}

export function OrderForm({ symbol, onOrder, balance }: OrderFormProps) {
    const [side, setSide] = useState<"buy" | "sell">("buy");
    const [orderType, setOrderType] = useState<"limit" | "market">("market");
    const [price, setPrice] = useState("45000");
    const [amount, setAmount] = useState("");
    const [sliderValue, setSliderValue] = useState(0);
    const [errors, setErrors] = useState({ amount: "", balance: "" });
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderStatus, setOrderStatus] = useState<"loading" | "success" | "error" | null>(null);
    const [closeProgress, setCloseProgress] = useState(0);

    useEffect(() => {
        if (orderStatus === "success" || orderStatus === "error") {
            // Start progress bar
            const duration = 3000; // 3 seconds
            const interval = 50; // Update every 50ms
            const steps = duration / interval;
            let currentStep = 0;

            const timer = setInterval(() => {
                currentStep++;
                setCloseProgress((currentStep / steps) * 100);

                if (currentStep >= steps) {
                    clearInterval(timer);
                    setIsSubmitting(false);
                    setOrderStatus(null);
                    setCloseProgress(0);
                }
            }, interval);

            return () => clearInterval(timer);
        }
    }, [orderStatus]);

    const baseAsset = symbol.replace("USDT", "");
    const balanceSymbol = "USDT";

    const handleSliderChange = (val: number | number[]) => {
        const v = Array.isArray(val) ? val[0] : val;
        setSliderValue(v);
        
        if (side === "buy" && price) {
            const max = balance / parseFloat(price);
            setAmount((max * (v / 100)).toFixed(6));
        }
        setErrors({ amount: "", balance: "" });
    };

    const validateOrder = (): boolean => {
        const newErrors = { amount: "", balance: "" };
        const amountNum = parseFloat(amount);
        const currentPrice = parseFloat(price);
        const total = amountNum * currentPrice;

        // Validate amount
        if (!amount || amountNum <= 0) {
            newErrors.amount = "Amount must be greater than 0";
            setErrors(newErrors);
            return false;
        }

        if (amountNum < 0.00001) {
            newErrors.amount = "Amount too small (min: 0.00001)";
            setErrors(newErrors);
            return false;
        }

        // Validate balance for buy orders
        if (side === "buy") {
            const fee = total * 0.001;
            const required = total + fee;
            
            if (required > balance) {
                newErrors.balance = `Insufficient balance. Required: ${required.toFixed(2)} USDT`;
                setErrors(newErrors);
                return false;
            }
        }

        setErrors({ amount: "", balance: "" });
        return true;
    };

    const handleSubmit = () => {
        console.log("Side:", side);
        console.log("Amount:", amount);
        console.log("Price:", price);
        console.log("Balance:", balance);
        console.log("Total:", total);
        console.log("Fee:", fee);
        console.log("Total with Fee:", totalWithFee);
        
        if (!validateOrder()) {
            console.log("Validation failed:", errors);
            return;
        }
        
        // Open confirmation modal
        setIsConfirmModalOpen(true);
    };

    const handleConfirmOrder = async () => {
        const currentPrice = parseFloat(price);
        const orderData = {
            side,
            amount: parseFloat(amount),
            price: currentPrice,
        };
        
        
        setIsSubmitting(true);
        setOrderStatus("loading");
        setIsConfirmModalOpen(false);
        
        // Call the order handler
        const result = await onOrder(orderData);

        // Show success or error
        if (result.error) {
            setOrderStatus("error");
        } else {
            setOrderStatus("success");
            // Reset form on success
            setAmount("");
            setSliderValue(0);
            setErrors({ amount: "", balance: "" });
        }
    };

    const total = parseFloat(price || "0") * parseFloat(amount || "0");
    const fee = total * 0.001;
    const totalWithFee = total + fee;

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
                        onValueChange={(val) => {
                            setAmount(val);
                            setErrors({ amount: "", balance: "" });
                        }}
                        variant="flat"
                        classNames={{ input: "font-mono" }}
                        isInvalid={!!errors.amount}
                        errorMessage={errors.amount}
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
                    {errors.balance && (
                        <p className="text-xs text-danger">{errors.balance}</p>
                    )}
                    <div className="flex justify-between text-xs text-default-500">
                        <span>Fee (0.1%)</span>
                        <span>{fee.toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                        <span>Total (USDT)</span>
                        <span>{totalWithFee ? totalWithFee.toFixed(2) : "0.00"}</span>
                    </div>
                </div>

                {/* Action Button */}
                <Button
                    size="lg"
                    isDisabled={!amount || parseFloat(amount) <= 0}
                    className={`w-full font-bold text-white shadow-lg ${side === "buy" ? "bg-green-500 shadow-green-500/20" : "bg-red-500 shadow-red-500/20"}`}
                    onPress={handleSubmit}
                >
                    {side === "buy" ? `Buy ${baseAsset}` : `Sell ${baseAsset}`}
                </Button>

            </CardBody>

            {/* Confirmation Modal */}
            <Modal isOpen={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen} size="md">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center gap-2">
                                <AlertCircle className={side === "buy" ? "text-success" : "text-danger"} size={24} />
                                <span>Confirm {side === "buy" ? "Buy" : "Sell"} Order</span>
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <div className={`p-4 rounded-lg ${side === "buy" ? "bg-success/10" : "bg-danger/10"}`}>
                                        <p className="text-sm text-default-500 mb-2">Order Summary</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-default-600">Side</span>
                                                <span className={`font-bold ${side === "buy" ? "text-success" : "text-danger"}`}>
                                                    {side.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-default-600">Pair</span>
                                                <span className="font-semibold">{baseAsset}/USDT</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-default-600">Amount</span>
                                                <span className="font-semibold">{amount} {baseAsset}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-default-600">Price</span>
                                                <span className="font-semibold">${parseFloat(price).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 p-4 bg-default-100 dark:bg-default-50/10 rounded-lg">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-default-600">Subtotal</span>
                                            <span className="font-semibold">{total.toFixed(2)} USDT</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-default-600">Trading Fee (0.1%)</span>
                                            <span className="font-semibold">{fee.toFixed(2)} USDT</span>
                                        </div>
                                        <Divider className="my-2" />
                                        <div className="flex justify-between">
                                            <span className="font-bold">Total</span>
                                            <span className="font-bold text-lg">{totalWithFee.toFixed(2)} USDT</span>
                                        </div>
                                    </div>

                                    <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 p-3 rounded-lg">
                                        <p className="text-xs text-warning-700 dark:text-warning-300">
                                            Please review your order carefully. This action cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color={side === "buy" ? "success" : "danger"}
                                    onPress={handleConfirmOrder}
                                    isLoading={isSubmitting}
                                    className="font-bold"
                                >
                                    Confirm {side === "buy" ? "Buy" : "Sell"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Full Page Loading Overlay */}
            {isSubmitting && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 min-w-[300px]">
                        {orderStatus === "loading" && (
                            <>
                                <Spinner size="lg" color={side === "buy" ? "success" : "danger"} />
                                <div className="text-center">
                                    <p className="text-lg font-bold mb-1">
                                        {side === "buy" ? "Buying" : "Selling"} {baseAsset}
                                    </p>
                                    <p className="text-sm text-default-500">
                                        Processing your order...
                                    </p>
                                </div>
                            </>
                        )}

                        {orderStatus === "success" && (
                            <>
                                <div className="relative">
                                    <CheckCircle size={64} className="text-success animate-in zoom-in duration-300" />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold mb-1 text-success">
                                        Order Successful!
                                    </p>
                                    <p className="text-sm text-default-500">
                                        {side === "buy" ? "Bought" : "Sold"} {amount} {baseAsset}
                                    </p>
                                </div>
                                <Progress 
                                    value={closeProgress} 
                                    color="success" 
                                    className="w-full"
                                    size="sm"
                                />
                            </>
                        )}

                        {orderStatus === "error" && (
                            <>
                                <div className="relative">
                                    <XCircle size={64} className="text-danger animate-in zoom-in duration-300" />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold mb-1 text-danger">
                                        Order Failed
                                    </p>
                                    <p className="text-sm text-default-500">
                                        Please try again
                                    </p>
                                </div>
                                <Progress 
                                    value={closeProgress} 
                                    color="danger" 
                                    className="w-full"
                                    size="sm"
                                />
                            </>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
}
