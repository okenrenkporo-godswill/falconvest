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

type IncreaseCopyAmountModalProps = {
  isOpen: boolean;
  onClose: () => void;
  copyTradeId: string;
  traderName: string;
  currentAmount: number;
  onSuccess: () => void;
};

export function IncreaseCopyAmountModal({
  isOpen,
  onClose,
  copyTradeId,
  traderName,
  currentAmount,
  onSuccess,
}: IncreaseCopyAmountModalProps) {
  const [additionalAmount, setAdditionalAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchBalance();
    }
  }, [isOpen]);

  const fetchBalance = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("balances")
      .select("amount")
      .eq("user_id", user.id)
      .eq("asset", "USDT")
      .eq("account_type", "trading")
      .maybeSingle();

    setBalance(data?.amount || 0);
    setLoading(false);
  };

  const handleIncrease = async () => {
    const amount = parseFloat(additionalAmount);
    
    if (!amount || amount <= 0) {
      addToast({
        title: "Error",
        description: "Please enter a valid amount",
        color: "danger",
      });
      return;
    }

    if (amount > balance) {
      addToast({
        title: "Error",
        description: "Insufficient balance",
        color: "danger",
      });
      return;
    }

    setIsSubmitting(true);
    const result = await increaseCopyAmount(copyTradeId, amount);
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

  const newTotal = currentAmount + (parseFloat(additionalAmount) || 0);

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

                <div className="flex items-center justify-between p-3 bg-default-100 dark:bg-default-50/10 rounded-lg">
                  <span className="text-sm text-default-500">USDT Balance</span>
                  <span className="font-bold">
                    {loading ? "..." : `$${balance.toLocaleString()}`}
                  </span>
                </div>

                <Input
                  label="Additional Amount (USDT)"
                  type="number"
                  value={additionalAmount}
                  onValueChange={setAdditionalAmount}
                  placeholder="Enter amount to add"
                  startContent={<span className="text-default-400">$</span>}
                  endContent={
                    <Button
                      size="sm"
                      variant="flat"
                      className="min-w-12"
                      onPress={() => setAdditionalAmount(balance.toString())}
                    >
                      Max
                    </Button>
                  }
                  isInvalid={additionalAmount ? parseFloat(additionalAmount) > balance : false}
                  errorMessage={
                    additionalAmount && parseFloat(additionalAmount) > balance
                      ? "Insufficient balance"
                      : ""
                  }
                />

                {additionalAmount && parseFloat(additionalAmount) > 0 && (
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
