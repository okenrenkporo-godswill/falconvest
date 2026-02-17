'use client';

import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button,
    Input, Select, SelectItem, Tabs, Tab, SharedSelection, useDisclosure, Skeleton
} from "@heroui/react";
import { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import Image from "next/image";
import { ProofUploadModal } from "./proof-upload-modal";
import { submitDepositProof } from "@/actions/deposits";
import { getActivePlatformWallets } from "@/actions/wallets";
import { getAvailableCoins } from "@/actions/coins";

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
    const [walletAddress, setWalletAddress] = useState<string>("");
    const [selectedWallet, setSelectedWallet] = useState<any>(null);
    const [isLoadingWallet, setIsLoadingWallet] = useState(false);
    const [coins, setCoins] = useState<Array<{ label: string; value: string; icon: string; logo?: string }>>([]);
    const [cryptoAmount, setCryptoAmount] = useState<string>("0");
    const [isLoadingRate, setIsLoadingRate] = useState(false);
    const [conversionError, setConversionError] = useState<string>("");
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const { isOpen: isProofOpen, onOpen: onProofOpen, onOpenChange: onProofOpenChange } = useDisclosure();

    // Fetch conversion rate when coin or amount changes
    useEffect(() => {
        const fetchRate = async () => {
            const usdAmount = parseFloat(amount.replace(/[^0-9.]/g, ""));
            if (!usdAmount || !selectedCoin) {
                setCryptoAmount("0");
                return;
            }

            setIsLoadingRate(true);
            setConversionError("");
            try {
                if (selectedCoin === 'USDT' || selectedCoin === 'USDC') {
                    setCryptoAmount(usdAmount.toFixed(2));
                    setIsLoadingRate(false);
                    return;
                }

                const coinIds: Record<string, string> = {
                    'BTC': 'bitcoin',
                    'ETH': 'ethereum',
                    'BNB': 'binancecoin',
                    'SOL': 'solana',
                    'XRP': 'ripple',
                    'ADA': 'cardano',
                    'DOGE': 'dogecoin',
                };

                const coinId = coinIds[selectedCoin];
                if (!coinId) {
                    setConversionError("Unsupported currency");
                    setCryptoAmount("0");
                    setIsLoadingRate(false);
                    return;
                }

                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
                
                if (!response.ok) {
                    throw new Error("Failed to fetch conversion rate");
                }

                const data = await response.json();
                const rate = data[coinId]?.usd;

                if (!rate) {
                    throw new Error("Rate not available");
                }

                const crypto = usdAmount / rate;
                setCryptoAmount(crypto.toFixed(8));
            } catch (error) {
                console.error("Failed to fetch rate:", error);
                setConversionError("Failed to get conversion rate. Please try again.");
                setCryptoAmount("0");
            } finally {
                setIsLoadingRate(false);
            }
        };

        fetchRate();
    }, [selectedCoin, amount]);

    useEffect(() => {
        getAvailableCoins().then(setCoins);
    }, []);

    useEffect(() => {
        if (isOpen && selectedCoin) {
            // Clear previous wallet and show loading
            setWalletAddress("");
            setSelectedWallet(null);
            setIsLoadingWallet(true);

            // Get platform wallet for selected coin
            getActivePlatformWallets().then((wallets) => {
                const wallet = wallets.find(w => w.symbol === selectedCoin);
                if (wallet) {
                    setWalletAddress(wallet.wallet_address);
                    setSelectedWallet(wallet);
                }
                setIsLoadingWallet(false);
            });
        }
    }, [isOpen, selectedCoin]);

    const handleSelectionChange = (keys: SharedSelection) => {
        // Current yields a Set, so we take the first value
        const selected = Array.from(keys).join("").replace(/_/g, "");
        // Or simpler if single selection:
        if (keys.currentKey) {
            setSelectedCoin(keys.currentKey as string);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" backdrop="blur" scrollBehavior="inside">
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
                                            {coins.map((coin) => (
                                                <SelectItem
                                                    key={coin.value}
                                                    startContent={
                                                        coin.logo ? (
                                                            <img src={coin.logo} alt={coin.value} className="w-5 h-5 rounded-full" />
                                                        ) : (
                                                            <span>{coin.icon}</span>
                                                        )
                                                    }
                                                >
                                                    {coin.label}
                                                </SelectItem>
                                            ))}
                                        </Select>

                                        {/* Conversion Display */}
                                        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs text-default-500 mb-1">You're depositing</p>
                                                    <p className="text-2xl font-bold text-primary">{amount}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-default-500 mb-1">You need to send</p>
                                                    {isLoadingRate ? (
                                                        <Skeleton className="h-8 w-32 rounded-lg" />
                                                    ) : conversionError ? (
                                                        <p className="text-sm text-danger">{conversionError}</p>
                                                    ) : (
                                                        <p className="text-2xl font-bold">{cryptoAmount} {selectedCoin}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {isLoadingWallet ? (
                                            <div className="flex flex-col items-center justify-center p-6 bg-default-100 rounded-lg">
                                                <Skeleton className="w-48 h-48 rounded-lg mb-4" />
                                                <div className="w-full space-y-2">
                                                    <Skeleton className="h-3 w-32 rounded-lg mx-auto" />
                                                    <Skeleton className="h-10 w-full rounded-lg" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-6 bg-default-100 rounded-lg">
                                                {/* Placeholder QR Code */}
                                                <div className="w-48 h-48 bg-white p-2 rounded-lg shadow-sm flex items-center justify-center mb-4 relative">
                                                    {/* Using standard img for external QR API is fine, or unoptimized Image */}
                                                    <Image
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${walletAddress || "loading"}`}
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
                                                        value={walletAddress || "Loading..."}
                                                        endContent={
                                                            <Button isIconOnly size="sm" variant="light" onPress={() => navigator.clipboard.writeText(walletAddress)}>
                                                                <Copy size={16} />
                                                            </Button>
                                                        }
                                                        classNames={{ input: "text-center font-mono text-xs sm:text-sm" }}
                                                    />
                                                </div>
                                            </div>
                                        )}

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
                                <Button 
                                    className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black" 
                                    onPress={() => setShowConfirmDialog(true)}
                                    isDisabled={isLoadingRate || !!conversionError || !walletAddress || parseFloat(cryptoAmount) === 0}
                                >
                                    I've Sent It
                                </Button>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>

            {/* Confirmation Dialog */}
            <Modal isOpen={showConfirmDialog} onOpenChange={setShowConfirmDialog} size="md">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Confirm Transaction</ModalHeader>
                            <ModalBody>
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        <strong>⚠️ Important:</strong> Please send only <strong>{coins.find(c => c.value === selectedCoin)?.label.split(' ')[0]}</strong> to this address. Sending any other token may result in permanent loss.
                                    </p>
                                </div>
                                <p className="text-sm text-default-600 mt-4">
                                    Have you sent <strong>{cryptoAmount} {selectedCoin}</strong> to the provided wallet address?
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="flat" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button 
                                    color="primary" 
                                    onPress={() => {
                                        setShowConfirmDialog(false);
                                        onProofOpen();
                                    }}
                                >
                                    Yes, Continue
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <ProofUploadModal
                isOpen={isProofOpen}
                onOpenChange={() => {
                    onProofOpenChange();
                    onOpenChange();
                }}
                walletAddress={walletAddress}
                amount={`${cryptoAmount} ${selectedCoin}`}
                accountType={accountType}
                onSubmit={async (proofImage) => {
                    await submitDepositProof({
                        coin: selectedCoin,
                        amount: parseFloat(cryptoAmount),
                        usdAmount: parseFloat(amount.replace(/[^0-9.]/g, "")),
                        walletAddress: walletAddress,
                        walletId: selectedWallet?.id,
                        accountType,
                        proofImage
                    });
                }}
            />
        </Modal>
    );
}
