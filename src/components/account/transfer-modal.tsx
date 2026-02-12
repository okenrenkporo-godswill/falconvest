"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Input,
} from "@heroui/react";
import { useState, useMemo } from "react";
import { ArrowRightLeft } from "lucide-react";
import { transferBetweenAccounts } from "@/actions/transfers";
import { addToast } from "@heroui/react";

interface TransferModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  balances: Array<{ asset: string; amount: number; account_type: string }>;
}

const ACCOUNTS = [
  { value: "trading", label: "Trading Account" },
  { value: "holdings", label: "Holdings Account" },
  { value: "staking", label: "Staking Account" },
];

export function TransferModal({ isOpen, onOpenChange, balances }: TransferModalProps) {
  const [fromAccount, setFromAccount] = useState("trading");
  const [toAccount, setToAccount] = useState("holdings");
  const [asset, setAsset] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get unique assets
  const assets = useMemo(() => {
    const unique = [...new Set(balances.map((b) => b.asset))];
    return unique;
  }, [balances]);

  // Get available balance for selected asset and from account
  const availableBalance = useMemo(() => {
    const balance = balances.find(
      (b) => b.asset === asset && b.account_type === fromAccount
    );
    return balance?.amount || 0;
  }, [balances, asset, fromAccount]);

  const handleMax = () => setAmount(availableBalance.toString());

  const handleSubmit = async () => {
    if (!asset || !amount || parseFloat(amount) <= 0) {
      addToast({ title: "Please fill all fields", color: "danger" });
      return;
    }

    if (fromAccount === toAccount) {
      addToast({ title: "Source and destination must be different", color: "danger" });
      return;
    }

    if (parseFloat(amount) > availableBalance) {
      addToast({ title: "Insufficient balance", color: "danger" });
      return;
    }

    setIsSubmitting(true);
    const result = await transferBetweenAccounts({
      asset,
      amount: parseFloat(amount),
      fromAccount,
      toAccount,
    });

    setIsSubmitting(false);

    if (result.error) {
      addToast({ title: result.error, color: "danger" });
    } else {
      addToast({ title: "Transfer completed successfully", color: "success" });
      setAmount("");
      onOpenChange();
      window.location.reload(); // Refresh to show updated balances
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-2">
              <ArrowRightLeft size={20} />
              Transfer Between Accounts
            </ModalHeader>
            <ModalBody className="space-y-4">
              <Select
                label="From Account"
                placeholder="Select source account"
                selectedKeys={[fromAccount]}
                onChange={(e) => setFromAccount(e.target.value)}
              >
                {ACCOUNTS.map((acc) => (
                  <SelectItem key={acc.value} textValue={acc.label}>
                    {acc.label}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="To Account"
                placeholder="Select destination account"
                selectedKeys={[toAccount]}
                onChange={(e) => setToAccount(e.target.value)}
              >
                {ACCOUNTS.filter((a) => a.value !== fromAccount).map((acc) => (
                  <SelectItem key={acc.value} textValue={acc.label}>
                    {acc.label}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Asset"
                placeholder="Select asset to transfer"
                selectedKeys={asset ? [asset] : []}
                onChange={(e) => setAsset(e.target.value)}
              >
                {assets.map((a) => (
                  <SelectItem key={a} textValue={a}>
                    {a}
                  </SelectItem>
                ))}
              </Select>

              <Input
                type="number"
                label="Amount"
                placeholder="0.00"
                value={amount}
                onValueChange={setAmount}
                description={`Available: ${availableBalance.toFixed(8)} ${asset || ""}`}
                endContent={
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    className="h-6 min-w-unit-12 px-2 text-xs"
                    onPress={handleMax}
                    isDisabled={!asset}
                  >
                    MAX
                  </Button>
                }
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button
                className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                onPress={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={!asset || !amount || parseFloat(amount) <= 0}
              >
                Transfer
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
