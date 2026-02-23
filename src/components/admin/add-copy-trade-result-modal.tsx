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
  addToast,
} from "@heroui/react";
import { useState } from "react";
import { adminCreateCopyPosition } from "@/actions/admin-copy-positions";
import { useRouter } from "next/navigation";

interface AddCopyTradeResultModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  copyTradeId: string;
  traderName: string;
}

export function AddCopyTradeResultModal({
  isOpen,
  onOpenChange,
  copyTradeId,
  traderName,
}: AddCopyTradeResultModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pair: "BTC/USDT",
    side: "buy" as "buy" | "sell",
    amount: "",
    entryPrice: "",
    profitLoss: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.amount || !formData.entryPrice || !formData.profitLoss) {
      addToast({ title: "Please fill all fields", color: "danger" });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await adminCreateCopyPosition({
        copyTradeId,
        pair: formData.pair,
        side: formData.side,
        amount: parseFloat(formData.amount),
        entryPrice: parseFloat(formData.entryPrice),
        profitLoss: parseFloat(formData.profitLoss),
      });

      if (result.error) {
        addToast({ title: result.error, color: "danger" });
      } else {
        addToast({
          title: "Trade result added successfully",
          color: "success",
        });
        onOpenChange();
        router.refresh();
        // Reset form
        setFormData({
          pair: "BTC/USDT",
          side: "buy",
          amount: "",
          entryPrice: "",
          profitLoss: "",
        });
      }
    } catch (error) {
      addToast({ title: "Failed to add trade result", color: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Add Trade Result
              <span className="text-sm font-normal text-default-500">
                For {traderName}
              </span>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Pair"
                  placeholder="e.g. BTC/USDT"
                  value={formData.pair}
                  onValueChange={(v) => handleChange("pair", v)}
                />

                <Select
                  label="Side"
                  selectedKeys={[formData.side]}
                  onChange={(e) => handleChange("side", e.target.value)}
                >
                  <SelectItem key="buy">Buy (Long)</SelectItem>
                  <SelectItem key="sell">Sell (Short)</SelectItem>
                </Select>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Amount"
                    placeholder="0.00"
                    value={formData.amount}
                    onValueChange={(v) => handleChange("amount", v)}
                  />
                  <Input
                    type="number"
                    label="Entry Price"
                    placeholder="0.00"
                    value={formData.entryPrice}
                    onValueChange={(v) => handleChange("entryPrice", v)}
                  />
                </div>

                <Input
                  type="number"
                  label="Exit Price (Profit/Loss in USDT)"
                  placeholder="0.00"
                  description="Negative value for loss"
                  value={formData.profitLoss}
                  onValueChange={(v) => handleChange("profitLoss", v)}
                  classNames={{
                    input: formData.profitLoss.startsWith("-")
                      ? "text-danger"
                      : "text-success",
                  }}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={isSubmitting}
              >
                Submit Result
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
