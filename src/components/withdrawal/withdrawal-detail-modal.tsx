"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Chip,
  Divider,
} from "@heroui/react";
import { Clock, CheckCircle, XCircle, Wallet, Network } from "lucide-react";

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

export function WithdrawalDetailModal({
  isOpen,
  onOpenChange,
  withdrawal,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  withdrawal: Withdrawal;
}) {
  const statusConfig = {
    pending: { color: "warning" as const, icon: Clock, label: "Pending Review" },
    approved: { color: "success" as const, icon: CheckCircle, label: "Approved" },
    rejected: { color: "danger" as const, icon: XCircle, label: "Rejected" },
  };

  const config = statusConfig[withdrawal.status as keyof typeof statusConfig];
  const Icon = config?.icon || Clock;

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Withdrawal Details
            </ModalHeader>
            <ModalBody className="pb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {withdrawal.amount} {withdrawal.coin}
                    </p>
                    <p className="text-sm text-default-400">
                      ≈ ${withdrawal.usd_value.toFixed(2)} USD
                    </p>
                  </div>
                  <Chip
                    size="lg"
                    color={config?.color}
                    variant="flat"
                    startContent={<Icon size={16} />}
                  >
                    {config?.label}
                  </Chip>
                </div>

                <Divider />

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Wallet size={18} className="text-default-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-default-400">Destination Address</p>
                      <p className="text-sm font-mono break-all">{withdrawal.destination_address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Network size={18} className="text-default-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-default-400">Network</p>
                      <p className="text-sm">{withdrawal.network}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-default-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-default-400">Requested At</p>
                      <p className="text-sm">{new Date(withdrawal.requested_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {withdrawal.processed_at && (
                    <div className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-default-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-default-400">Processed At</p>
                        <p className="text-sm">{new Date(withdrawal.processed_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="w-[18px] h-[18px] rounded-full bg-default-100 dark:bg-zinc-800 flex items-center justify-center mt-0.5">
                      <span className="text-[10px] font-bold">{withdrawal.coin[0]}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-default-400">Account Type</p>
                      <p className="text-sm capitalize">{withdrawal.account_type}</p>
                    </div>
                  </div>

                  {withdrawal.rejection_reason && (
                    <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-3">
                      <p className="text-xs text-danger-700 dark:text-danger-300 font-medium mb-1">
                        Rejection Reason
                      </p>
                      <p className="text-sm text-danger-900 dark:text-danger-100">
                        {withdrawal.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
