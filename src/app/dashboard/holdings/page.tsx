"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Button, Skeleton, addToast, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select, SelectItem, Chip } from "@heroui/react";
import { getUserHoldings, transferBetweenAccounts } from "@/actions/holdings";
import { Wallet, ArrowRightLeft, TrendingUp, Lock, Plus } from "lucide-react";
import Link from "next/link";
import { AssetConverter } from "@/components/shared/asset-converter";
import { createClient } from "@/lib/supabase/client";

type Holding = {
  asset: string;
  total: number;
  trading: number;
  staking: number;
  price?: number;
  value?: number;
};

type Balance = {
  asset: string;
  amount: number;
};

export default function HoldingsPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [transferData, setTransferData] = useState({
    amount: "",
    fromAccount: new Set<string>(),
    toAccount: new Set<string>(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otherBalances, setOtherBalances] = useState<Balance[]>([]);
  const [convertTarget, setConvertTarget] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    loadData();
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("first_name, last_name")
      .eq("user_id", user.id)
      .single();

    setUserName(profile ? `${profile.first_name} ${profile.last_name}` : "User");
    setUserEmail(user.email || "");
  };

  const loadData = async () => {
    setLoading(true);
    const result = await getUserHoldings();
    
    if (result.holdings) {
      // Fetch prices from CoinGecko
      const holdingsWithPrices = await Promise.all(
        result.holdings.map(async (holding: any) => {
          const price = await fetchPrice(holding.asset);
          return {
            ...holding,
            price,
            value: holding.total * price,
          };
        })
      );
      setHoldings(holdingsWithPrices);
    }
    
    setLoading(false);
  };

  const fetchPrice = async (asset: string): Promise<number> => {
    const coinIds: Record<string, string> = {
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

    const coinId = coinIds[asset];
    if (!coinId) return 1;

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
      );
      const data = await response.json();
      return data[coinId]?.usd || 1;
    } catch {
      return 1;
    }
  };

  const handleOpenTransfer = (holding: Holding) => {
    setSelectedHolding(holding);
    setTransferData({ amount: "", fromAccount: new Set(), toAccount: new Set() });
    setIsTransferModalOpen(true);
  };

  const handleOpenConvert = async (holding: Holding, accountType: "trading" | "staking") => {
    setSelectedHolding(holding);
    setConvertTarget(holding.asset);
    
    // Fetch other balances for the same account type
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: allBalances } = await supabase
      .from("balances")
      .select("asset, amount")
      .eq("user_id", user.id)
      .eq("account_type", accountType)
      .neq("asset", holding.asset)
      .gt("amount", 0);

    setOtherBalances(allBalances || []);
    setIsConvertModalOpen(true);
  };

  const handleTransfer = async () => {
    if (!selectedHolding) return;

    const fromAccount = Array.from(transferData.fromAccount)[0] as "trading" | "staking";
    const toAccount = Array.from(transferData.toAccount)[0] as "trading" | "staking";
    const amount = parseFloat(transferData.amount);

    if (!fromAccount || !toAccount) {
      addToast({
        title: "Error",
        description: "Please select both accounts",
        color: "danger",
      });
      return;
    }

    if (!amount || amount <= 0) {
      addToast({
        title: "Error",
        description: "Please enter a valid amount",
        color: "danger",
      });
      return;
    }

    const maxAmount = fromAccount === "trading" ? selectedHolding.trading : selectedHolding.staking;
    if (amount > maxAmount) {
      addToast({
        title: "Error",
        description: "Insufficient balance",
        color: "danger",
      });
      return;
    }

    setIsSubmitting(true);
    const result = await transferBetweenAccounts({
      asset: selectedHolding.asset,
      amount,
      fromAccount,
      toAccount,
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
        description: `Transferred ${amount} ${selectedHolding.asset}`,
        color: "success",
      });
      setIsTransferModalOpen(false);
      loadData();
    }
  };

  const totalValue = holdings.reduce((sum, h) => sum + (h.value || 0), 0);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Holdings</h1>
          <p className="text-default-500">Manage your crypto portfolio</p>
          {userName && (
            <div className="mt-2 text-sm">
              <p className="font-semibold">{userName}</p>
              <p className="text-default-500">{userEmail}</p>
            </div>
          )}
        </div>
        <Link href="/dashboard/deposit">
          <Button color="primary" startContent={<Plus size={16} />}>
            Add Funds
          </Button>
        </Link>
      </div>

      {/* Total Value Card */}
      <Card className="border-none shadow-sm dark:bg-content1/50">
        <CardBody className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-default-500 mb-1">Total Portfolio Value</p>
              <p className="text-2xl md:text-3xl font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 md:p-4 rounded-full bg-primary/10 self-start md:self-center">
              <Wallet className="text-primary" size={24} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Holdings List */}
      <div className="space-y-4">
        {holdings.map((holding) => (
          <Card key={holding.asset} className="border-none shadow-sm dark:bg-content1/50">
            <CardBody className="p-4 md:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-2 md:p-3 rounded-lg bg-primary/10">
                      <Wallet className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold">{holding.asset}</h3>
                      <p className="text-xs md:text-sm text-default-500">
                        ${holding.price?.toLocaleString()} per {holding.asset}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<ArrowRightLeft size={16} />}
                    onPress={() => handleOpenTransfer(holding)}
                    className="hidden md:flex"
                  >
                    Transfer
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 md:flex md:items-center md:justify-end md:gap-8">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-default-500 mb-1">Total</p>
                    <p className="text-sm md:text-lg font-bold">{holding.total.toFixed(6)}</p>
                    <p className="text-xs md:text-sm text-default-500">${holding.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-xs text-default-500 mb-1">
                      <TrendingUp size={12} className="inline mr-1" />
                      Trading
                    </p>
                    <p className="text-sm md:text-base font-semibold">{holding.trading.toFixed(6)}</p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-xs text-default-500 mb-1">
                      <Lock size={12} className="inline mr-1" />
                      Staking
                    </p>
                    <p className="text-sm md:text-base font-semibold">{holding.staking.toFixed(6)}</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  startContent={<ArrowRightLeft size={16} />}
                  onPress={() => handleOpenTransfer(holding)}
                  className="md:hidden w-full"
                >
                  Transfer
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}

        {holdings.length === 0 && (
          <Card className="border-none shadow-sm dark:bg-content1/50">
            <CardBody className="text-center py-12">
              <p className="text-default-500 mb-4">No holdings yet</p>
              <Link href="/dashboard/deposit">
                <Button color="primary" startContent={<Plus size={16} />}>
                  Add Funds
                </Button>
              </Link>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Transfer Modal */}
      <Modal isOpen={isTransferModalOpen} onOpenChange={setIsTransferModalOpen} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Transfer {selectedHolding?.asset}</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-3 bg-default-100 dark:bg-default-50/10 rounded-lg">
                    <div>
                      <p className="text-xs text-default-500 mb-1">Trading Account</p>
                      <p className="font-bold">{selectedHolding?.trading.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-default-500 mb-1">Staking Account</p>
                      <p className="font-bold">{selectedHolding?.staking.toFixed(6)}</p>
                    </div>
                  </div>

                  <Select
                    label="From Account"
                    placeholder="Select source"
                    selectedKeys={transferData.fromAccount}
                    onSelectionChange={(keys) => setTransferData({ ...transferData, fromAccount: keys as Set<string> })}
                  >
                    <SelectItem key="trading" textValue="Trading Account">
                      Trading Account ({selectedHolding?.trading.toFixed(6)})
                    </SelectItem>
                    <SelectItem key="staking" textValue="Staking Account">
                      Staking Account ({selectedHolding?.staking.toFixed(6)})
                    </SelectItem>
                  </Select>

                  <Select
                    label="To Account"
                    placeholder="Select destination"
                    selectedKeys={transferData.toAccount}
                    onSelectionChange={(keys) => setTransferData({ ...transferData, toAccount: keys as Set<string> })}
                  >
                    <SelectItem key="trading" textValue="Trading Account">
                      Trading Account
                    </SelectItem>
                    <SelectItem key="staking" textValue="Staking Account">
                      Staking Account
                    </SelectItem>
                  </Select>

                  <Input
                    label="Amount"
                    type="number"
                    value={transferData.amount}
                    onValueChange={(value) => setTransferData({ ...transferData, amount: value })}
                    placeholder="0.00"
                    endContent={
                      <Button
                        size="sm"
                        variant="flat"
                        className="min-w-12"
                        onPress={() => {
                          const fromAccount = Array.from(transferData.fromAccount)[0];
                          const maxAmount = fromAccount === "trading" ? selectedHolding?.trading : selectedHolding?.staking;
                          setTransferData({ ...transferData, amount: maxAmount?.toString() || "" });
                        }}
                      >
                        Max
                      </Button>
                    }
                    isInvalid={
                      transferData.amount
                        ? parseFloat(transferData.amount) > (Array.from(transferData.fromAccount)[0] === "trading" ? selectedHolding?.trading || 0 : selectedHolding?.staking || 0)
                        : false
                    }
                    errorMessage={
                      transferData.amount && parseFloat(transferData.amount) > (Array.from(transferData.fromAccount)[0] === "trading" ? selectedHolding?.trading || 0 : selectedHolding?.staking || 0)
                        ? "Insufficient balance"
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
                  onPress={handleTransfer}
                  isLoading={isSubmitting}
                  startContent={<ArrowRightLeft size={16} />}
                >
                  Transfer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
