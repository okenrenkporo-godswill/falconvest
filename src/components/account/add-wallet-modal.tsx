"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Switch,
} from "@heroui/react";
import { useState } from "react";
import { addUserWallet } from "@/actions/wallets";
import { addToast } from "@heroui/react";

const COINS = [
  { value: "BTC", label: "Bitcoin (BTC)", network: "Bitcoin" },
  { value: "ETH", label: "Ethereum (ETH)", network: "ERC-20" },
  { value: "USDT", label: "Tether (USDT)", network: "TRC-20" },
  { value: "SOL", label: "Solana (SOL)", network: "Solana" },
];

interface AddWalletModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSuccess: () => void;
}

export function AddWalletModal({ isOpen, onOpenChange, onSuccess }: AddWalletModalProps) {
  const [symbol, setSymbol] = useState("");
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [tag, setTag] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCoin = COINS.find((c) => c.value === symbol);

  const handleSubmit = async () => {
    if (!symbol || !address) {
      addToast({ title: "Please fill required fields", color: "danger" });
      return;
    }

    setIsSubmitting(true);
    const result = await addUserWallet({
      symbol,
      wallet_address: address,
      network: selectedCoin?.network || "",
      tag: tag || null,
      label: label || null,
      is_default: isDefault,
    });

    setIsSubmitting(false);

    if (result.error) {
      addToast({ title: result.error, color: "danger" });
    } else {
      addToast({ title: "Wallet added successfully", color: "success" });
      setSymbol("");
      setAddress("");
      setLabel("");
      setTag("");
      setIsDefault(false);
      onSuccess();
      onOpenChange();
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Add Withdrawal Wallet</ModalHeader>
            <ModalBody className="space-y-4">
              <Select
                label="Coin"
                placeholder="Select coin"
                selectedKeys={symbol ? [symbol] : []}
                onChange={(e) => setSymbol(e.target.value)}
                isRequired
              >
                {COINS.map((coin) => (
                  <SelectItem key={coin.value} textValue={coin.label}>
                    <div className="flex flex-col">
                      <span>{coin.label}</span>
                      <span className="text-xs text-default-400">Network: {coin.network}</span>
                    </div>
                  </SelectItem>
                ))}
              </Select>

              <Input
                label="Wallet Address"
                placeholder="Enter wallet address"
                value={address}
                onValueChange={setAddress}
                isRequired
              />

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
                description="Some networks require a memo/tag"
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
                isDisabled={!symbol || !address}
              >
                Add Wallet
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
