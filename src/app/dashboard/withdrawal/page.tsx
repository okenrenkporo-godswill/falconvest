'use client';

import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Divider,
} from "@heroui/react";
import { useState, useEffect, useMemo } from "react";
import {
  Wallet, Info, ShieldCheck, TrendingUp, Bitcoin
} from "lucide-react";
import { WithdrawalHistory } from "@/components/withdrawal/withdrawal-history";
import { getUserWithdrawals, submitWithdrawal, getUserBalances } from "@/actions/withdrawals";
import { getUserWallets } from "@/actions/wallets";
import { addToast } from "@heroui/react";

const ACCOUNTS = {
  trading: { label: "Trading Account", icon: TrendingUp },
  holdings: { label: "Holdings Account", icon: Bitcoin },
  staking: { label: "Staking Account", icon: ShieldCheck }
};

const COINS = [
  { label: "Bitcoin (BTC)", value: "BTC", icon: "₿", network: "Bitcoin" },
  { label: "Ethereum (ETH)", value: "ETH", icon: "Ξ", network: "ERC-20" },
  { label: "Tether (USDT)", value: "USDT", icon: "₮", network: "TRC-20" },
];

export default function WithdrawalPage() {
  const [accountType, setAccountType] = useState<string>("trading");
  const [coin, setCoin] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(true);
  const [balances, setBalances] = useState<any[]>([]);
  const [savedWallets, setSavedWallets] = useState<any[]>([]);
  const [useManualAddress, setUseManualAddress] = useState(false);

  const currentAccount = ACCOUNTS[accountType as keyof typeof ACCOUNTS];
  
  // Get unique accounts that have balances
  const accountsWithBalances = useMemo(() => {
    const accounts = [...new Set(balances.map(b => b.account_type))];
    return accounts.map(accType => ({
      value: accType,
      label: ACCOUNTS[accType as keyof typeof ACCOUNTS]?.label || accType,
      icon: ACCOUNTS[accType as keyof typeof ACCOUNTS]?.icon,
      balance: balances
        .filter(b => b.account_type === accType)
        .reduce((sum, b) => sum + Number(b.amount), 0)
    }));
  }, [balances]);

  // Get coins available in selected account
  const availableCoins = useMemo(() => {
    return balances
      .filter(b => b.account_type === accountType && Number(b.amount) > 0)
      .map(b => ({
        value: b.asset,
        label: b.asset,
        balance: Number(b.amount)
      }));
  }, [balances, accountType]);
  
  // Get balance for selected account and coin
  const accountBalance = useMemo(() => {
    const balance = balances.find(
      (b) => b.asset === coin && b.account_type === accountType
    );
    return balance?.amount || 0;
  }, [balances, coin, accountType]);

  // Get saved wallets for selected coin
  const walletsForCoin = useMemo(() => {
    return savedWallets.filter(w => w.symbol === coin && w.status === 'active');
  }, [savedWallets, coin]);

  useEffect(() => {
    setIsLoadingWithdrawals(true);
    Promise.all([getUserWithdrawals(), getUserBalances(), getUserWallets()]).then(([withdrawalsData, balancesData, walletsData]) => {
      setWithdrawals(withdrawalsData);
      setBalances(balancesData);
      setSavedWallets(walletsData);
      setIsLoadingWithdrawals(false);

      // Set first available account and coin
      if (balancesData && balancesData.length > 0) {
        const firstAccount = balancesData[0].account_type;
        const firstCoin = balancesData[0].asset;
        setAccountType(firstAccount);
        setCoin(firstCoin);
      }
    });
  }, []);

  // Update coin when account changes
  useEffect(() => {
    const coinsInAccount = balances.filter(b => b.account_type === accountType);
    if (coinsInAccount.length > 0) {
      setCoin(coinsInAccount[0].asset);
    }
  }, [accountType, balances]);

  // Auto-select default wallet when coin changes
  useEffect(() => {
    const defaultWallet = savedWallets.find(w => w.symbol === coin && w.is_default && w.status === 'active');
    if (defaultWallet && !walletAddress) {
      setWalletAddress(defaultWallet.wallet_address);
      setUseManualAddress(false);
    }
  }, [coin, savedWallets]);

  const handleMax = () => setAmount(accountBalance.toString());

  const handleSubmit = async () => {
    if (!amount || !walletAddress) {
      addToast({ title: "Please fill all fields", color: "danger" });
      return;
    }

    if (parseFloat(amount) <= 0 || parseFloat(amount) > accountBalance) {
      addToast({ title: "Invalid amount", color: "danger" });
      return;
    }

    setIsSubmitting(true);
    const result = await submitWithdrawal({
      coin,
      amount: parseFloat(amount),
      destinationAddress: walletAddress,
      network: COINS.find((c) => c.value === coin)?.network || "",
      accountType,
    });

    setIsSubmitting(false);

    if (result.error) {
      addToast({ title: result.error, color: "danger" });
    } else {
      addToast({ title: "Withdrawal request submitted successfully", color: "success" });
      setAmount("");
      setWalletAddress("");
      
      const [withdrawalsData, balancesData] = await Promise.all([
        getUserWithdrawals(),
        getUserBalances()
      ]);
      setWithdrawals(withdrawalsData);
      setBalances(balancesData);
    }
  };

  const isValidAmount = useMemo(() => {
    if (!amount) return true;
    const val = parseFloat(amount);
    return val > 0 && val <= accountBalance;
  }, [amount, accountBalance]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-8 pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-default-900 to-default-500 bg-clip-text text-transparent">
          Withdraw Funds
        </h1>
        <p className="text-default-500 text-sm">Securely transfer assets to your external wallet.</p>
      </div>

      <Card className="border-none shadow-medium bg-background/60 dark:bg-content1/50 overflow-visible">
        <CardBody className="p-8 gap-8">
          <div className="space-y-6">
            <div>
              <Select
                label="From Account"
                placeholder="Select source account"
                selectedKeys={[accountType]}
                onChange={(e) => setAccountType(e.target.value)}
                startContent={currentAccount && <currentAccount.icon size={18} />}
                description={`Available Balance: $${accountBalance.toFixed(2)}`}
                isDisabled={accountsWithBalances.length === 0}
              >
                {accountsWithBalances.map((acc) => (
                  <SelectItem 
                    key={acc.value} 
                    startContent={acc.icon && <acc.icon size={18} className="text-default-400" />} 
                    textValue={acc.label}
                  >
                    <div className="flex justify-between items-center w-full pr-2">
                      <span>{acc.label}</span>
                      <span className="text-xs text-default-400 font-mono">${acc.balance.toFixed(2)}</span>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <Select
                label="Select Asset"
                placeholder="Select Coin"
                selectedKeys={coin ? [coin] : []}
                onChange={(e) => setCoin(e.target.value)}
                isDisabled={availableCoins.length === 0}
                description={availableCoins.length === 0 ? "No assets in this account" : undefined}
              >
                {availableCoins.map((c) => (
                  <SelectItem key={c.value} textValue={c.label}>
                    <div className="flex justify-between items-center w-full pr-2">
                      <span>{c.label}</span>
                      <span className="text-xs text-default-400 font-mono">{c.balance.toFixed(8)}</span>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>

            <Divider className="my-2" />

            <div>
              <Input
                type="number"
                label="Amount"
                placeholder="0.00"
                value={amount}
                onValueChange={setAmount}
                labelPlacement="inside"
                variant="flat"
                startContent={<span className="text-default-400 text-sm">$</span>}
                endContent={
                  <Button size="sm" variant="flat" color="primary" className="h-6 min-w-unit-12 px-2 text-xs" onPress={handleMax}>
                    MAX
                  </Button>
                }
                isInvalid={!isValidAmount}
                errorMessage={!isValidAmount ? "Insufficient balance" : ""}
                classNames={{ input: "font-semibold text-lg font-mono" }}
              />
            </div>

            {/* Saved Wallets or Manual Address */}
            {walletsForCoin.length > 0 && !useManualAddress ? (
              <div>
                <Select
                  label="Select Saved Wallet"
                  placeholder="Choose a saved wallet"
                  selectedKeys={walletAddress ? [walletAddress] : []}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  description={
                    <button
                      onClick={() => setUseManualAddress(true)}
                      className="text-xs text-primary hover:underline"
                    >
                      Or enter address manually
                    </button>
                  }
                >
                  {walletsForCoin.map((w) => (
                    <SelectItem key={w.wallet_address} textValue={w.label || w.wallet_address}>
                      <div className="flex flex-col">
                        <span className="font-medium">{w.label || 'Unnamed Wallet'}</span>
                        <span className="text-xs text-default-400 font-mono">{w.wallet_address.slice(0, 20)}...</span>
                        {w.is_default && <span className="text-xs text-warning">Default</span>}
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>
            ) : (
              <div>
                <Input
                  label={`Wallet Address (${coin})`}
                  placeholder={`Enter your ${coin} withdrawal address`}
                  value={walletAddress}
                  onValueChange={setWalletAddress}
                  labelPlacement="inside"
                  variant="flat"
                  startContent={<Wallet size={18} className="text-default-400" />}
                  description={
                    walletsForCoin.length > 0 ? (
                      <button
                        onClick={() => setUseManualAddress(false)}
                        className="text-xs text-primary hover:underline"
                      >
                        Or select from saved wallets
                      </button>
                    ) : (
                      <a href="/dashboard/account/wallets" className="text-xs text-primary hover:underline">
                        Save wallets for faster withdrawals
                      </a>
                    )
                  }
                />
              </div>
            )}

            <Button
              size="lg"
              className="w-full font-semibold shadow-lg shadow-default/20 mt-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
              isLoading={isSubmitting}
              onPress={handleSubmit}
              isDisabled={!amount || !walletAddress || !isValidAmount}
            >
              Submit Withdrawal
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="flex gap-2 justify-center text-xs text-default-400">
        <Info size={14} className="mt-0.5" />
        <span>Processing time: 1-24 hours depending on network congestion.</span>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Withdrawal History</h2>
        <WithdrawalHistory withdrawals={withdrawals} isLoading={isLoadingWithdrawals} />
      </div>
    </div>
  );
}
