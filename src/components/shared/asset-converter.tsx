"use client";

import { useState, useEffect } from "react";
import { Button, Select, SelectItem, Input, addToast } from "@heroui/react";
import { ArrowRightLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Balance = {
  asset: string;
  amount: number;
};

interface AssetConverterProps {
  targetAsset?: string;
  accountType: "trading" | "staking";
  otherBalances: Balance[];
  onConversionComplete: () => void;
  defaultOpen?: boolean;
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

export function AssetConverter({ targetAsset, accountType, otherBalances, onConversionComplete, defaultOpen = false }: AssetConverterProps) {
  const [showSwap, setShowSwap] = useState(defaultOpen);
  const [swapFrom, setSwapFrom] = useState<Set<string>>(new Set());
  const [swapTo, setSwapTo] = useState<Set<string>>(targetAsset ? new Set([targetAsset]) : new Set());
  const [swapAmount, setSwapAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [conversionRate, setConversionRate] = useState(1);
  const [loadingRate, setLoadingRate] = useState(false);

  const effectiveTargetAsset = targetAsset || Array.from(swapTo)[0];

  useEffect(() => {
    if (swapFrom.size > 0 && effectiveTargetAsset) {
      const asset = Array.from(swapFrom)[0];
      if (asset !== effectiveTargetAsset) {
        fetchConversionRate(asset, effectiveTargetAsset);
      }
    }
  }, [swapFrom, effectiveTargetAsset]);

  const fetchConversionRate = async (fromAsset: string, toAsset: string) => {
    setLoadingRate(true);

    try {
      const fromCoinId = COINGECKO_IDS[fromAsset] || fromAsset.toLowerCase();
      const toCoinId = COINGECKO_IDS[toAsset] || toAsset.toLowerCase();

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${fromCoinId},${toCoinId}&vs_currencies=usd`
      );
      const data = await response.json();

      const getRate = (id: string, symbol: string) => {
        if (['USDT', 'USDC', 'DAI', 'BUSD'].includes(symbol.toUpperCase())) return 1;
        return data[id]?.usd || 1;
      };

      const fromRate = getRate(fromCoinId, fromAsset);
      const toRate = getRate(toCoinId, toAsset);

      // Calculate conversion rate (how much target asset you get per source asset)
      setConversionRate(fromRate / toRate);
    } catch (error) {
      console.error("Failed to fetch conversion rate:", error);
      setConversionRate(1);
    } finally {
      setLoadingRate(false);
    }
  };

  const handleSwap = async () => {
    const selectedAsset = Array.from(swapFrom)[0];
    const amount = parseFloat(swapAmount);

    if (!selectedAsset) {
      addToast({
        title: "Error",
        description: "Please select an asset to swap from",
        color: "danger",
      });
      return;
    }

    if (!effectiveTargetAsset) {
      addToast({
        title: "Error",
        description: "Please select an asset to swap to",
        color: "danger",
      });
      return;
    }

    if (!swapAmount || amount <= 0) {
      addToast({
        title: "Error",
        description: "Please enter a valid amount",
        color: "danger",
      });
      return;
    }

    const selectedBalance = otherBalances.find(b => b.asset === selectedAsset);
    if (!selectedBalance || amount > selectedBalance.amount) {
      addToast({
        title: "Error",
        description: "Insufficient balance",
        color: "danger",
      });
      return;
    }

    setIsSwapping(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSwapping(false);
      return;
    }

    try {
      // Debit source asset
      await supabase.rpc("debit_balance", {
        p_user_id: user.id,
        p_asset: selectedAsset,
        p_amount: amount,
        p_account_type: accountType,
      });

      // Credit target asset
      const targetAmount = amount * conversionRate;
      await supabase.rpc("credit_balance", {
        p_user_id: user.id,
        p_asset: effectiveTargetAsset,
        p_amount: targetAmount,
        p_account_type: accountType,
      });

      addToast({
        title: "Success",
        description: `Converted ${amount} ${selectedAsset} to ${targetAmount.toFixed(6)} ${effectiveTargetAsset}`,
        color: "success",
      });

      setShowSwap(false);
      setSwapFrom(new Set());
      // Don't reset swapTo if it was passed via props
      if (!targetAsset) setSwapTo(new Set());
      setSwapAmount("");
      setConversionRate(1);
      onConversionComplete();
    } catch (error: any) {
      addToast({
        title: "Error",
        description: error.message,
        color: "danger",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  if (otherBalances.length === 0) return null;

  if (!showSwap) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
          You have {otherBalances.map(b => `${b.amount} ${b.asset}`).join(", ")} available.
        </p>
        <Button
          size="sm"
          color="primary"
          variant="flat"
          startContent={<ArrowRightLeft size={14} />}
          onPress={() => setShowSwap(true)}
        >
          {targetAsset ? `Convert to ${targetAsset}` : "Swap Assets"}
        </Button>
      </div>
    );
  }

  const selectedAsset = Array.from(swapFrom)[0];
  const estimatedOutput = swapAmount ? (parseFloat(swapAmount) * conversionRate).toFixed(6) : "0";

  // Available assets for "To" selection (exclude selected "From" asset)
  // Ideally we should list all supported assets, but for now we can maybe list assets the user has 
  // OR just a hardcoded list of popular assets if we want them to be able to swap to anything.
  // For simplicity, let's allow swapping TO any asset that we support (COINGECKO_IDS keys).
  const supportedAssets = Object.keys(COINGECKO_IDS);

  return (
    <div className="bg-default-100 dark:bg-default-50/10 p-4 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Convert Assets</h4>
        <Button
          size="sm"
          variant="light"
          onPress={() => {
            setShowSwap(false);
            setSwapFrom(new Set());
            if (!targetAsset) setSwapTo(new Set());
            setSwapAmount("");
          }}
        >
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Select
          label="From Asset"
          placeholder="Select asset"
          selectedKeys={swapFrom}
          onSelectionChange={setSwapFrom as any}
        >
          {otherBalances.map((bal) => (
            <SelectItem key={bal.asset} textValue={`${bal.asset} ${bal.amount}`}>
              {bal.asset} (Available: {bal.amount})
            </SelectItem>
          ))}
        </Select>

        {!targetAsset && (
          <Select
            label="To Asset"
            placeholder="Select asset"
            selectedKeys={swapTo}
            onSelectionChange={setSwapTo as any}
            disallowEmptySelection
          >
            {supportedAssets.filter(a => a !== selectedAsset).map((asset) => (
              <SelectItem key={asset} textValue={asset}>
                {asset}
              </SelectItem>
            ))}
          </Select>
        )}
      </div>

      <Input
        label="Amount"
        type="number"
        value={swapAmount}
        onValueChange={setSwapAmount}
        placeholder="0.00"
        description={selectedAsset ? `Max: ${otherBalances.find(b => b.asset === selectedAsset)?.amount}` : ""}
        endContent={
          selectedAsset && (
            <Button
              size="sm"
              variant="flat"
              className="min-w-12"
              onPress={() => {
                const maxAmount = otherBalances.find(b => b.asset === selectedAsset)?.amount || 0;
                setSwapAmount(maxAmount.toString());
              }}
            >
              Max
            </Button>
          )
        }
        isInvalid={selectedAsset && swapAmount ? parseFloat(swapAmount) > (otherBalances.find(b => b.asset === selectedAsset)?.amount || 0) : false}
        errorMessage={selectedAsset && swapAmount && parseFloat(swapAmount) > (otherBalances.find(b => b.asset === selectedAsset)?.amount || 0) ? "Insufficient balance" : ""}
      />

      {selectedAsset && effectiveTargetAsset && swapAmount && (
        <div className="bg-default-200/50 dark:bg-default-100/10 p-2 rounded text-sm">
          <div className="flex justify-between">
            <span className="text-default-500">Rate:</span>
            <span className="font-semibold">
              {loadingRate ? "Loading..." : `1 ${selectedAsset} = ${conversionRate.toFixed(6)} ${effectiveTargetAsset}`}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-default-500">You'll receive:</span>
            <span className="font-bold text-success">≈ {estimatedOutput} {effectiveTargetAsset}</span>
          </div>
        </div>
      )}

      <Button
        color="primary"
        className="w-full"
        onPress={handleSwap}
        isLoading={isSwapping}
        isDisabled={!selectedAsset || !effectiveTargetAsset || !swapAmount || loadingRate}
        startContent={<ArrowRightLeft size={16} />}
      >
        Convert to {effectiveTargetAsset || "Selected Asset"}
      </Button>
    </div>
  );
}
