"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  addToast,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { increaseCopyAmount } from "@/actions/copy-trading";
import { createClient } from "@/lib/supabase/client";

// Fallback BTC/USD rate to match home screen (~$60,385)
const DEFAULT_BTC_USD_RATE = 60385;

type IncreaseCopyAmountModalProps = {
  isOpen: boolean;
  onClose: () => void;
  copyTradeId: string;
  traderName: string;
  currentAmount: number; // Always stored in USD/USDT value or asset units? Let's check.
  /** The asset used when starting this copy trade (defaults to USDT) */
  asset?: string;
  onSuccess: () => void;
};

const SUPPORTED_ASSETS = ["USDT", "BTC"] as const;
type SupportedAsset = typeof SUPPORTED_ASSETS[number];

export function IncreaseCopyAmountModal({
  isOpen,
  onClose,
  copyTradeId,
  traderName,
  currentAmount,
  asset: initialAsset = "USDT",
  onSuccess,
}: IncreaseCopyAmountModalProps) {
  // Amount is ALWAYS entered in USD
  const [additionalAmount, setAdditionalAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<SupportedAsset>(
    (SUPPORTED_ASSETS as readonly string[]).includes(initialAsset)
      ? (initialAsset as SupportedAsset)
      : "USDT"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balances, setBalances] = useState<Record<SupportedAsset, number>>({ USDT: 0, BTC: 0 });
  const [loading, setLoading] = useState(true);
  const [btcPrice, setBtcPrice] = useState<number>(DEFAULT_BTC_USD_RATE);

  useEffect(() => {
    if (isOpen) {
      fetchBalance();
      fetchBtcPriceSilently();
    }
  }, [isOpen]);

  // Reset amount when switching assets
  useEffect(() => {
    setAdditionalAmount("");
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
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: allBalances } = await supabase
      .from("balances")
      .select("asset, amount")
      .eq("user_id", user.id)
      .eq("account_type", "trading")
      .in("asset", ["USDT", "BTC"]);

    const newBalances: Record<SupportedAsset, number> = { USDT: 0, BTC: 0 };
    (allBalances || []).forEach((b) => {
      if (b.asset === "USDT") newBalances.USDT = b.amount;
      if (b.asset === "BTC") newBalances.BTC = b.amount;
    });

    setBalances(newBalances);
    setLoading(false);
  };

  const parsedAmount = parseFloat(additionalAmount) || 0;

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

  const handleIncrease = async () => {
    if (!parsedAmount || parsedAmount <= 0) {
      addToast({
        title: "Error",
        description: "Please enter a valid amount",
        color: "danger",
      });
      return;
    }

    if (parsedAmount > usdBalance) {
      addToast({
        title: "Error",
        description: "Insufficient balance",
        color: "danger",
      });
      return;
    }

    // Convert USD input -> BTC units if paying with BTC
    const amountToSend = selectedAsset === "BTC"
      ? parsedAmount / btcPrice
      : parsedAmount;

    setIsSubmitting(true);
    const result = await increaseCopyAmount(copyTradeId, amountToSend, selectedAsset);
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
        description: `Increased copy amount to $${result.newAmount?.toLocaleString()}`,
        color: "success",
      });
      setAdditionalAmount("");
      onClose();
      onSuccess();
    }
  };

  const newTotal = currentAmount + parsedAmount;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" backdrop="blur">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h2 className="text-xl font-bold">Increase Copy Amount</h2>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="p-3 bg-default-100 dark:bg-default-50/10 rounded-lg">
                  <p className="text-sm text-default-500 mb-1">Copying</p>
                  <p className="font-bold">{traderName}</p>
                </div>

                <div className="flex items-center justify-between p-3 bg-default-100 dark:bg-default-50/10 rounded-lg">
                  <span className="text-sm text-default-500">Current Amount</span>
                  <span className="font-bold">${currentAmount.toLocaleString()}</span>
                </div>

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

                {/* Balance Display */}
                <div className="flex items-center justify-between p-3 bg-default-100 dark:bg-default-50/10 rounded-lg">
                  <span className="text-sm text-default-500">{selectedAsset} Balance</span>
                  <span className="font-bold">{balanceLabel}</span>
                </div>

                <Input
                  label="Additional Amount (USD)"
                  type="number"
                  value={additionalAmount}
                  onValueChange={setAdditionalAmount}
                  placeholder="Enter amount to add"
                  startContent={<span className="text-default-400">$</span>}
                  description={
                    selectedAsset === "BTC" && parsedAmount > 0
                      ? `≈ ${(parsedAmount / btcPrice).toFixed(8)} BTC will be debited`
                      : ""
                  }
                  endContent={
                    <Button
                      size="sm"
                      variant="flat"
                      className="min-w-12"
                      onPress={() => setAdditionalAmount(usdBalance.toFixed(2))}
                    >
                      Max
                    </Button>
                  }
                  isInvalid={!!additionalAmount ? parsedAmount > usdBalance : false}
                  errorMessage={
                    additionalAmount && parsedAmount > usdBalance
                      ? "Insufficient balance"
                      : ""
                  }
                />

                {additionalAmount && parsedAmount > 0 && (
                  <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                    <p className="text-sm text-default-500 mb-1">New Total Amount</p>
                    <p className="text-2xl font-bold text-primary">${newTotal.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleIncrease}
                isLoading={isSubmitting}
              >
                Increase Amount
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
