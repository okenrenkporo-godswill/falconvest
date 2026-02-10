'use client';

import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button,
    Input, Select, SelectItem, Tabs, Tab, SharedSelection
} from "@heroui/react";
import { useState } from "react";
import { Copy } from "lucide-react";
import Image from "next/image";

export function CryptoPaymentModal({
    isOpen,
    onOpenChange,
    accountType,
    amount
}: {
    isOpen: boolean;
    onOpenChange: () => void;
    accountType: string;
    amount: string
}) {
    const [selectedCoin, setSelectedCoin] = useState<string>("BTC");
    const [key, setKey] = useState<string>("send");

    // Placeholder addresses
    const ADDRESSES: Record<string, string> = {
        BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        ETH: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        USDT: "TJ8p3yE5gqA2x9Rz7y4w1Qv6tL8u9o0p8"
    };

    const COINS = [
        { label: "Bitcoin (BTC)", value: "BTC", icon: "₿" },
        { label: "Ethereum (ETH)", value: "ETH", icon: "Ξ" },
        { label: "Tether (USDT - TRX)", value: "USDT", icon: "₮" },
    ];

    const handleSelectionChange = (keys: SharedSelection) => {
        // Current yields a Set, so we take the first value
        const selected = Array.from(keys).join("").replace(/_/g, "");
        // Or simpler if single selection:
        if (keys.currentKey) {
            setSelectedCoin(keys.currentKey as string);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold">Deposit Funds</h2>
                            <p className="text-sm text-default-500 font-normal">
                                Adding {amount || "$0.00"} to your <span className="text-primary font-semibold">{accountType}</span> account via Crypto.
                            </p>
                        </ModalHeader>
                        <ModalBody>
                            <Tabs
                                fullWidth
                                size="md"
                                aria-label="Payment Options"
                                selectedKey={key}
                                onSelectionChange={(k) => setKey(k as string)}
                            >
                                <Tab key="send" title="Send Crypto">
                                    <div className="flex flex-col gap-4 mt-2">
                                        <Select
                                            label="Select Currency"
                                            placeholder="Select a coin"
                                            selectedKeys={[selectedCoin]}
                                            // @ts-ignore - Handle complex type or use onChange if simple event is needed, but SelectionChange is standard
                                            onSelectionChange={(keys) => {
                                                const val = Array.from(keys)[0];
                                                if (val) setSelectedCoin(val as string);
                                            }}
                                        >
                                            {COINS.map((coin) => (
                                                <SelectItem key={coin.value} startContent={coin.icon}>
                                                    {coin.label}
                                                </SelectItem>
                                            ))}
                                        </Select>

                                        <div className="flex flex-col items-center justify-center p-6 bg-default-100 rounded-lg">
                                            {/* Placeholder QR Code */}
                                            <div className="w-48 h-48 bg-white p-2 rounded-lg shadow-sm flex items-center justify-center mb-4 relative">
                                                {/* Using standard img for external QR API is fine, or unoptimized Image */}
                                                <Image
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ADDRESSES[selectedCoin] || "address"}`}
                                                    alt="QR Code"
                                                    width={150}
                                                    height={150}
                                                    unoptimized
                                                    className="object-contain"
                                                />
                                            </div>

                                            <div className="w-full">
                                                <p className="text-xs text-default-500 mb-1 font-medium uppercase text-center">Wallet Address</p>
                                                <Input
                                                    readOnly
                                                    value={ADDRESSES[selectedCoin] || "Select a coin"}
                                                    endContent={
                                                        <Button isIconOnly size="sm" variant="light" onPress={() => navigator.clipboard.writeText(ADDRESSES[selectedCoin])}>
                                                            <Copy size={16} />
                                                        </Button>
                                                    }
                                                    classNames={{ input: "text-center font-mono text-xs sm:text-sm" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Tab>
                                <Tab key="buy" title="Buy Crypto">
                                    <div className="flex flex-col gap-3 mt-2">
                                        <p className="text-sm text-default-500 mb-2">Buy crypto with your credit card securely via our partners.</p>

                                        {[
                                            { name: "Coinbase", url: "https://www.coinbase.com/", icon: "🔵" },
                                            { name: "Crypto.com", url: "https://crypto.com/", icon: "🦁" },
                                            { name: "MoonPay", url: "https://www.moonpay.com/", icon: "🌙" }
                                        ].map((provider) => (
                                            <Button
                                                key={provider.name}
                                                as="a"
                                                href={provider.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full justify-between bg-content1 shadow-sm border border-default-200"
                                                endContent={<span>↗</span>}
                                                variant="flat"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>{provider.icon}</span>
                                                    <span>Buy on {provider.name}</span>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </Tab>
                            </Tabs>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            {key === "send" && (
                                <Button className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black" onPress={() => {
                                    // Validate Logic Here
                                    onClose();
                                }}>
                                    I've Sent It
                                </Button>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
