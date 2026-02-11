'use client';

import {
  Card, CardBody, Button, Input, Select, SelectItem,
  Divider
} from "@heroui/react";
import { useState, useMemo } from "react";
import {
  Wallet, Info, CheckCircle, ShieldCheck, TrendingUp, Bitcoin
} from "lucide-react";

// Mock Data
const ACCOUNTS = {
  trading: { label: "Trading Account", balance: 12500.50, icon: TrendingUp, color: "primary" },
  mining: { label: "Mining Account", balance: 3450.75, icon: Bitcoin, color: "warning" },
  staking: { label: "Staking Account", balance: 8900.00, icon: ShieldCheck, color: "success" }
};

const COINS = [
  { label: "Bitcoin (BTC)", value: "BTC", icon: "₿", network: "Bitcoin" },
  { label: "Ethereum (ETH)", value: "ETH", icon: "Ξ", network: "ERC-20" },
  { label: "Tether (USDT)", value: "USDT", icon: "₮", network: "TRC-20" },
  { label: "Solana (SOL)", value: "SOL", icon: "◎", network: "Solana" }
];

export default function WithdrawalPage() {
  const [accountType, setAccountType] = useState<string>("trading");
  const [coin, setCoin] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: OTP, 3: Success

  const currentAccount = ACCOUNTS[accountType as keyof typeof ACCOUNTS];
  const maxAmount = currentAccount?.balance || 0;

  const handleMax = () => setAmount(maxAmount.toString());

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    if (parseFloat(amount) > maxAmount) return;
    if (!walletAddress) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2); // Move to OTP
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3); // Success
    }, 1500);
  };

  const isValidAmount = useMemo(() => {
    if (!amount) return true;
    const val = parseFloat(amount);
    return val > 0 && val <= maxAmount;
  }, [amount, maxAmount]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-8 pb-12"> {/* Centered, smaller width */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-default-900 to-default-500 bg-clip-text text-transparent">
          Withdraw Funds
        </h1>
        <p className="text-default-500 text-sm">Securely transfer assets to your external wallet.</p>
      </div>

      <Card className="border-none shadow-medium bg-background/60 dark:bg-content1/50 overflow-visible">
        <CardBody className="p-8 gap-8">

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Account Selector (Dropdown) */}
              <div>
                <Select
                  label="From Account"
                  placeholder="Select source account"
                  selectedKeys={[accountType]}
                  onChange={(e) => setAccountType(e.target.value)}
                  startContent={currentAccount && <currentAccount.icon size={18} className={`text-${currentAccount.color === 'primary' ? 'blue' : currentAccount.color === 'warning' ? 'amber' : 'green'}-500`} />}
                  description={`Available Balance: $${maxAmount.toLocaleString()}`}
                >
                  {(Object.entries(ACCOUNTS) as [string, typeof ACCOUNTS['trading']][]).map(([key, acc]) => (
                    <SelectItem key={key} startContent={<acc.icon size={18} className="text-default-400" />} textValue={acc.label}>
                      <div className="flex justify-between items-center w-full pr-2">
                        <span>{acc.label}</span>
                        <span className="text-xs text-default-400 font-mono">${acc.balance.toLocaleString()}</span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Coin Selector */}
              <div>
                <Select
                  label="Select Asset"
                  placeholder="Select Coin"
                  defaultSelectedKeys={["BTC"]}
                  onChange={(e) => setCoin(e.target.value)}
                >
                  {COINS.map((c) => (
                    <SelectItem key={c.value} startContent={c.icon} textValue={c.label}>
                      <div className="flex flex-col">
                        <span className="text-small">{c.label}</span>
                        <span className="text-tiny text-default-400">Network: {c.network}</span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <Divider className="my-2" />

              {/* Amount Input */}
              {/* Amount Input */}
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

              {/* Wallet Address */}
              <div>
                <Input
                  label={`Wallet Address (${coin})`}
                  placeholder={`Enter your ${coin} withdrawal address`}
                  value={walletAddress}
                  onValueChange={setWalletAddress}
                  labelPlacement="inside"
                  variant="flat"
                  startContent={<Wallet size={18} className="text-default-400" />}
                  description="Please verify the address carefully. Transactions cannot be reversed."
                />
              </div>

              {/* Submit Button */}
              <Button
                size="lg"
                className="w-full font-semibold shadow-lg shadow-default/20 mt-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                isLoading={isSubmitting}
                onPress={handleSubmit}
                isDisabled={!amount || !walletAddress || !isValidAmount}
              >
                Proceed to Verification
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <ShieldCheck size={32} />
                </div>
              </div>
              <h2 className="text-xl font-bold">Security Verification</h2>
              <p className="text-sm text-default-500 max-w-xs mx-auto">
                A confirmation code has been sent to your registered email address.
              </p>

              <div className="max-w-xs mx-auto">
                <Input
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onValueChange={setOtp}
                  classNames={{ input: "text-center text-2xl tracking-widest font-mono" }}
                  maxLength={6}
                />
                <div className="flex justify-between items-center mt-2 px-1">
                  <span className="text-xs text-default-400">Code expires in 04:59</span>
                  <button className="text-xs text-primary font-medium hover:underline">Resend Code</button>
                </div>
              </div>

              <div className="flex gap-3 justify-center pt-4">
                <Button variant="flat" onPress={() => setStep(1)}>Back</Button>
                <Button className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black" onPress={handleVerifyOtp} isLoading={isSubmitting} isDisabled={otp.length < 4}>
                  Confirm Withdrawal
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center py-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 relative">
                  <CheckCircle size={40} />
                  <div className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-20"></div>
                </div>
              </div>
              <h2 className="text-2xl font-bold">Withdrawal Submitted!</h2>
              <p className="text-default-500 max-w-sm mx-auto">
                Your request for <span className="font-semibold text-foreground">${amount} ({coin})</span> has been received and is being processed.
              </p>

              <div className="pt-6">
                <Button className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black" variant="ghost" onPress={() => { setStep(1); setAmount(""); setWalletAddress(""); setOtp(""); }}>
                  Make Another Withdrawal
                </Button>
              </div>
            </div>
          )}

        </CardBody>
      </Card>

      {/* Footer Info */}
      <div className="flex gap-2 justify-center text-xs text-default-400">
        <Info size={14} className="mt-0.5" />
        <span>Processing time: 1-24 hours depending on network congestion.</span>
      </div>

    </div>
  );
}
