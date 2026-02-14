"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { useState } from "react";
import { adminSetTradeOutcome } from "@/actions/trades";

interface TradeOutcomeModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  trade: {
    id: string;
    pair: string;
    side: string;
    amount: number;
    entry_price: number;
  };
}

export function TradeOutcomeModal({
  isOpen,
  onOpenChange,
  trade,
}: TradeOutcomeModalProps) {
  const [exitPrice, setExitPrice] = useState("");
  const [pnl, setPnl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatePnL = (exit: string) => {
    if (!exit) return;
    const exitVal = parseFloat(exit);
    const entryVal = Number(trade.entry_price);
    const amount = Number(trade.amount);
    
    let calculatedPnl = 0;
    if (trade.side === "buy") {
      calculatedPnl = (exitVal - entryVal) * amount;
    } else {
      calculatedPnl = (entryVal - exitVal) * amount;
    }
    
    setPnl(calculatedPnl.toFixed(2));
  };

  const handleSubmit = async () => {
    if (!exitPrice || !pnl) return;

    setIsSubmitting(true);
    try {
      const result = await adminSetTradeOutcome(
        trade.id,
        parseFloat(exitPrice),
        parseFloat(pnl)
      );

      if (result.success) {
        onOpenChange();
      } else {
        alert("Error: " + result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Set Trade Outcome</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="bg-default-50 p-4 rounded-lg">
                  <p className="text-sm text-default-500">Trade Details</p>
                  <p className="font-semibold">{trade.pair}</p>
                  <p className="text-sm">
                    {trade.side.toUpperCase()} {trade.amount} @ ${Number(trade.entry_price).toLocaleString()}
                  </p>
                </div>

                <Input
                  type="number"
                  label="Exit Price"
                  placeholder="Enter exit price"
                  value={exitPrice}
                  onValueChange={(val) => {
                    setExitPrice(val);
                    calculatePnL(val);
                  }}
                  startContent={<span className="text-default-400">$</span>}
                />

                <Input
                  type="number"
                  label="P&L (USD)"
                  placeholder="Calculated automatically"
                  value={pnl}
                  onValueChange={setPnl}
                  startContent={<span className="text-default-400">$</span>}
                  description="Positive for profit, negative for loss"
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
                isDisabled={!exitPrice || !pnl}
              >
                Close Trade
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
