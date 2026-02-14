"use client";

import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  useDisclosure,
} from "@heroui/react";
import { useState } from "react";
import { PricingModal } from "@/components/deposit/pricing-modal";
import { CryptoPaymentModal } from "@/components/deposit/crypto-payment-modal";
import {
  Wallet,
  Info,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Bitcoin,
} from "lucide-react";

import { Suspense, useEffect } from "react";
import { DepositHistory } from "@/components/deposit/deposit-history";
import { getUserDeposits } from "@/actions/deposits";
import { useSearchParams } from "next/navigation";

function DepositContent() {
  const searchParams = useSearchParams();
  const walletParam = searchParams.get("wallet");

  const [amount, setAmount] = useState("");
  const [accountType, setAccountType] = useState("trading");
  const [deposits, setDeposits] = useState<any[]>([]);
  const [isLoadingDeposits, setIsLoadingDeposits] = useState(true);

  useEffect(() => {
    if (walletParam) {
      if (["trading", "holdings", "staking"].includes(walletParam)) {
        setAccountType(walletParam);
      }
    }
  }, [walletParam]);

  useEffect(() => {
    setIsLoadingDeposits(true);
    getUserDeposits().then((data) => {
      setDeposits(data);
      setIsLoadingDeposits(false);
    });
  }, []);

  const {
    isOpen: isPricingOpen,
    onOpen: onPricingOpen,
    onOpenChange: onPricingOpenChange,
  } = useDisclosure();
  const {
    isOpen: isPaymentOpen,
    onOpen: onPaymentOpen,
    onOpenChange: onPaymentOpenChange,
  } = useDisclosure();

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    onPaymentOpen();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-4">
      <div className="flex justify-between items-center sm:hidden">
        <h1 className="text-2xl font-bold">Deposit Funds</h1>
      </div>

      <div className="hidden sm:block">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-default-900 to-default-500 bg-clip-text text-transparent">
          Fund Your Account
        </h1>
        <p className="text-default-500 mt-1">
          Select an account type and choose your preferred payment method.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Deposit Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm dark:bg-content1/50">
            <CardBody className="gap-6 p-6">
              {/* Account Selection */}
              <div>
                <label className="text-sm font-medium text-default-600 mb-2 block">
                  Step 1: Select Account
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "trading", label: "Trading", icon: TrendingUp },
                    { id: "holdings", label: "Holdings", icon: Wallet }, // Changed from Mining
                    { id: "staking", label: "Staking", icon: ShieldCheck },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setAccountType(type.id)}
                      className={`
                        flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200
                        ${
                          accountType === type.id
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-default-50 border-transparent hover:bg-default-100 text-default-500"
                        }
                      `}
                    >
                      <type.icon size={24} className="mb-2" />
                      <span className="text-xs font-semibold">
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-default-600">
                    Step 2: Enter Amount
                  </label>
                  <Button
                    size="sm"
                    variant="light"
                    color="primary"
                    className="h-6 px-2 text-xs"
                    endContent={<ArrowUpRight size={14} />}
                    onPress={onPricingOpen}
                  >
                    View Packages
                  </Button>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-default-400 text-xl font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-default-50 dark:bg-default-100 border-none rounded-xl py-4 pl-10 pr-4 text-3xl font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-default-200 dark:text-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="w-full font-semibold shadow-lg shadow-default/30 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                  startContent={<Wallet size={20} />}
                  onPress={handleDeposit}
                >
                  Confirm Deposits
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Info Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
              <div className="flex gap-3">
                <div className="mt-1">
                  <Info size={20} className="text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-700 dark:text-blue-400 text-sm">
                    Instant Credit
                  </h4>
                  <p className="text-xs text-blue-600/80 dark:text-blue-400/70 mt-1">
                    Deposits via crypto are credited automatically after 1-3
                    network confirmations.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
              <div className="flex gap-3">
                <div className="mt-1">
                  <ShieldCheck size={20} className="text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-700 dark:text-green-400 text-sm">
                    Secure Processing
                  </h4>
                  <p className="text-xs text-green-600/80 dark:text-green-400/70 mt-1">
                    All transactions are encrypted and processed through secure
                    generic gateways.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Summary (Desktop Only, or collapse on mobile) */}
        <div className="hidden lg:block space-y-6">
          <Card className="bg-gradient-to-br from-default-900 to-default-800 text-white border-none">
            <CardBody className="p-6">
              <h3 className="font-bold text-lg mb-1">Need Crypto?</h3>
              <p className="text-default-300 text-sm mb-4">
                You can buy Bitcoin, Ethereum and more directly from our
                partners.
              </p>
              <Button
                className="w-full bg-white text-black font-semibold"
                endContent={<ArrowUpRight size={16} />}
                onPress={() => {
                  // Could open the same payment modal but default to 'buy' tab
                  onPaymentOpen();
                }}
              >
                Buy Crypto Now
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <PricingModal 
        isOpen={isPricingOpen} 
        onOpenChange={onPricingOpenChange}
        onSelectPackage={(packageAmount) => {
          setAmount(packageAmount.toString());
        }}
      />
      <CryptoPaymentModal
        isOpen={isPaymentOpen}
        onOpenChange={() => {
          onPaymentOpenChange();
          setIsLoadingDeposits(true);
          getUserDeposits().then((data) => {
            setDeposits(data);
            setIsLoadingDeposits(false);
          });
        }}
        accountType={accountType.toUpperCase()}
        amount={`$${amount || "0.00"}`}
      />

      {/* Deposit History */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Deposit History</h2>
        <DepositHistory deposits={deposits} isLoading={isLoadingDeposits} />
      </div>
    </div>
  );
}

export default function DepositPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DepositContent />
    </Suspense>
  );
}
