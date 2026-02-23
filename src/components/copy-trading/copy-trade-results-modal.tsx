"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Skeleton,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { getCopyTradeResults } from "@/actions/copy-trading";

type CopyTradeResultsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  copyTradeId: string;
  traderName: string;
};

export function CopyTradeResultsModal({
  isOpen,
  onClose,
  copyTradeId,
  traderName,
}: CopyTradeResultsModalProps) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadResults();
    }
  }, [isOpen, copyTradeId]);

  const loadResults = async () => {
    setLoading(true);
    const { data } = await getCopyTradeResults(copyTradeId);
    setResults(data || []);
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">Trade Results</h3>
          <p className="text-sm text-default-500 font-normal">
            Copying {traderName}
          </p>
        </ModalHeader>
        <ModalBody>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-default-200 rounded-lg">
                  <Skeleton className="h-4 w-32 rounded-lg mb-2" />
                  <Skeleton className="h-3 w-48 rounded-lg" />
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-default-500">No trade results yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="p-4 border border-default-200 dark:border-default-100 rounded-lg bg-default-50 dark:bg-default-50/5"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-base">{result.pair}</span>
                        <Chip
                          size="sm"
                          color={result.side === "buy" ? "success" : "danger"}
                          variant="flat"
                        >
                          {result.side.toUpperCase()}
                        </Chip>
                        <Chip
                          size="sm"
                          color={
                            result.status === "closed"
                              ? "default"
                              : result.status === "open"
                              ? "primary"
                              : "warning"
                          }
                          variant="flat"
                        >
                          {result.status}
                        </Chip>
                      </div>
                      <p className="text-xs text-default-500">
                        {formatDate(result.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-default-400 mb-1">P&L</p>
                      <p
                        className={`text-lg font-bold ${
                          result.profit_loss >= 0 ? "text-success" : "text-danger"
                        }`}
                      >
                        {result.profit_loss >= 0 ? "+" : ""}
                        {formatCurrency(result.profit_loss)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-default-400 mb-1">Amount</p>
                      <p className="font-medium">{result.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-default-400 mb-1">Entry Price</p>
                      <p className="font-medium">{formatCurrency(result.entry_price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-default-400 mb-1">Exit Price</p>
                      <p className="font-medium">
                        {result.exit_price ? formatCurrency(result.exit_price) : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
