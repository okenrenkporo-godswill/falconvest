"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Switch,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { updateUserWallet } from "@/actions/wallets";
import { addToast } from "@heroui/react";

interface EditWalletModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  wallet: {
    id: string;
    symbol: string;
    wallet_address: string;
    network: string;
    tag?: string;
    label?: string;
    is_default: boolean;
  };
  onSuccess: () => void;
}

export function EditWalletModal({ isOpen, onOpenChange, wallet, onSuccess }: EditWalletModalProps) {
  const [label, setLabel] = useState(wallet.label || "");
  const [tag, setTag] = useState(wallet.tag || "");
  const [isDefault, setIsDefault] = useState(wallet.is_default);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLabel(wallet.label || "");
    setTag(wallet.tag || "");
    setIsDefault(wallet.is_default);
  }, [wallet]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await updateUserWallet(wallet.id, {
      label: label || undefined,
      isDefault: isDefault,
    });

    setIsSubmitting(false);

    if (result.error) {
      addToast({ title: result.error, color: "danger" });
    } else {
      addToast({ title: "Wallet updated successfully", color: "success" });
      onSuccess();
      onOpenChange();
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Edit Wallet</ModalHeader>
            <ModalBody className="space-y-4">
              <div className="bg-default-100 p-3 rounded-lg">
                <p className="text-sm text-default-500">Coin</p>
                <p className="font-bold">{wallet.symbol}</p>
                <p className="text-xs text-default-400 mt-1">{wallet.network}</p>
              </div>

              <div className="bg-default-100 p-3 rounded-lg">
                <p className="text-sm text-default-500">Address</p>
                <p className="text-xs font-mono break-all">{wallet.wallet_address}</p>
              </div>

              <Input
                label="Label (Optional)"
                placeholder="e.g., My Binance Wallet"
                value={label}
                onValueChange={setLabel}
              />

              <Input
                label="Memo/Tag (Optional)"
                placeholder="Enter memo or tag if required"
                value={tag}
                onValueChange={setTag}
              />

              <Switch isSelected={isDefault} onValueChange={setIsDefault}>
                Set as default wallet
              </Switch>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={isSubmitting}
              >
                Update Wallet
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
