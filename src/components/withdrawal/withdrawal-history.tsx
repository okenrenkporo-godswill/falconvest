"use client";

import { Card, CardBody, Chip, Button, useDisclosure, Skeleton } from "@heroui/react";
import { Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { WithdrawalDetailModal } from "./withdrawal-detail-modal";
import { useState } from "react";

interface Withdrawal {
  id: string;
  coin: string;
  amount: number;
  usd_value: number;
  destination_address: string;
  network: string;
  account_type: string;
  status: string;
  requested_at: string;
  processed_at?: string;
  rejection_reason?: string;
}

export function WithdrawalHistory({ withdrawals, isLoading }: { withdrawals: Withdrawal[]; isLoading?: boolean }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);

  const statusConfig = {
    pending: { color: "warning" as const, icon: Clock, label: "Pending" },
    approved: { color: "success" as const, icon: CheckCircle, label: "Approved" },
    rejected: { color: "danger" as const, icon: XCircle, label: "Rejected" },
  };

  const handleView = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    onOpen();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-none shadow-sm dark:bg-zinc-900">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32 rounded-lg" />
                    <Skeleton className="h-3 w-48 rounded-lg" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  if (!withdrawals || withdrawals.length === 0) {
    return (
      <Card className="bg-transparent shadow-none border-none">
        <CardBody className="text-center py-12 text-default-400">
          <p className="text-sm">No withdrawal history</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {withdrawals.map((withdrawal) => {
          const config = statusConfig[withdrawal.status as keyof typeof statusConfig];
          const Icon = config?.icon || Clock;

          return (
            <Card key={withdrawal.id} className="border-none shadow-sm dark:bg-zinc-900">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-default-100 dark:bg-zinc-800 flex items-center justify-center">
                      <span className="font-bold text-sm text-default-600">{withdrawal.coin}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {withdrawal.amount} {withdrawal.coin}
                        </p>
                        <Chip size="sm" color={config?.color} variant="flat" startContent={<Icon size={12} />}>
                          {config?.label}
                        </Chip>
                      </div>
                      <p className="text-xs text-default-400">
                        {new Date(withdrawal.requested_at).toLocaleString()} • {withdrawal.account_type}
                      </p>
                      {withdrawal.rejection_reason && (
                        <p className="text-xs text-danger mt-1">{withdrawal.rejection_reason}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<Eye size={16} />}
                    onPress={() => handleView(withdrawal)}
                  >
                    View
                  </Button>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {selectedWithdrawal && (
        <WithdrawalDetailModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          withdrawal={selectedWithdrawal}
        />
      )}
    </>
  );
}
