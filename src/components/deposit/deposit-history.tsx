"use client";

import { Card, CardBody, Chip, Button, useDisclosure, Skeleton } from "@heroui/react";
import { Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { DepositDetailModal } from "./deposit-detail-modal";
import { useState } from "react";

interface Deposit {
  id: string;
  coin: string;
  amount: number;
  usd_value: number;
  wallet_address: string;
  account_type: string;
  proof_path: string;
  status: string;
  created_at: string;
  confirmed_at?: string;
  rejection_reason?: string;
  wallets?: {
    logo_url?: string;
  };
}

export function DepositHistory({ deposits, isLoading }: { deposits: Deposit[]; isLoading?: boolean }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);

  const statusConfig = {
    pending: { color: "warning" as const, icon: Clock, label: "Pending" },
    confirmed: { color: "success" as const, icon: CheckCircle, label: "Confirmed" },
    rejected: { color: "danger" as const, icon: XCircle, label: "Rejected" },
  };

  const handleView = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
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

  if (!deposits || deposits.length === 0) {
    return (
      <Card className="bg-transparent shadow-none border-none">
        <CardBody className="text-center py-12 text-default-400">
          <p className="text-sm">No deposit history</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {deposits.map((deposit) => {
          const config = statusConfig[deposit.status as keyof typeof statusConfig];
          const Icon = config?.icon || Clock;

          return (
            <Card key={deposit.id} className="border-none shadow-sm dark:bg-zinc-900">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-default-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {deposit.wallets?.logo_url ? (
                        <img 
                          src={deposit.wallets.logo_url} 
                          alt={deposit.coin} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-sm text-default-600">{deposit.coin}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {deposit.amount} {deposit.coin}
                        </p>
                        <Chip size="sm" color={config?.color} variant="flat" startContent={<Icon size={12} />}>
                          {config?.label}
                        </Chip>
                      </div>
                      <p className="text-xs text-default-400">
                        {new Date(deposit.created_at).toLocaleString()} • {deposit.account_type}
                      </p>
                      {deposit.rejection_reason && (
                        <p className="text-xs text-danger mt-1">{deposit.rejection_reason}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<Eye size={16} />}
                    onPress={() => handleView(deposit)}
                  >
                    View
                  </Button>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {selectedDeposit && (
        <DepositDetailModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          deposit={selectedDeposit}
        />
      )}
    </>
  );
}
