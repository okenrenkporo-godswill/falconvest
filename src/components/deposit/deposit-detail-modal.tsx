"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  Chip,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { getDepositProofUrl } from "@/actions/deposits";

interface DepositDetailModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  deposit: {
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
    admin_notes?: string;
  };
}

export function DepositDetailModal({
  isOpen,
  onOpenChange,
  deposit,
}: DepositDetailModalProps) {
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && deposit.proof_path) {
      getDepositProofUrl(deposit.proof_path).then((data) => {
        if (data && "signedUrl" in data) {
          setProofUrl(data.signedUrl);
        }
      });
    }
  }, [isOpen, deposit.proof_path]);

  const statusConfig = {
    pending: { color: "warning" as const, icon: Clock, label: "Pending Review" },
    confirmed: { color: "success" as const, icon: CheckCircle, label: "Confirmed" },
    rejected: { color: "danger" as const, icon: XCircle, label: "Rejected" },
  };

  const config = statusConfig[deposit.status as keyof typeof statusConfig];
  const Icon = config?.icon || Clock;

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div>
                <h3 className="text-xl font-bold">Deposit Details</h3>
                <p className="text-sm text-default-500 font-normal">
                  Transaction information and proof
                </p>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Deposit Details */}
                <div className="space-y-4">
                  {/* Status Banner */}
                  <Card className={`p-4 ${
                    deposit.status === "confirmed" ? "bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800" :
                    deposit.status === "rejected" ? "bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800" :
                    "bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800"
                  }`}>
                    <div className="flex items-center gap-3">
                      <Icon size={24} className={
                        deposit.status === "confirmed" ? "text-success" :
                        deposit.status === "rejected" ? "text-danger" :
                        "text-warning"
                      } />
                      <div className="flex-1">
                        <p className="font-semibold">{config?.label}</p>
                        <p className="text-xs text-default-600">
                          {deposit.status === "pending" && "Your deposit is being reviewed by our team"}
                          {deposit.status === "confirmed" && `Confirmed on ${new Date(deposit.confirmed_at!).toLocaleString()}`}
                          {deposit.status === "rejected" && deposit.rejection_reason}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Deposit Info */}
                  <Card className="bg-default-50 dark:bg-default-100/50 p-4">
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-default-500 text-xs">Amount</p>
                        <p className="font-semibold text-lg">
                          {deposit.amount} {deposit.coin}
                        </p>
                        <p className="text-xs text-default-400">≈ ${deposit.usd_value.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-default-500 text-xs">Account Type</p>
                        <p className="font-semibold capitalize">{deposit.account_type}</p>
                      </div>
                      <div>
                        <p className="text-default-500 text-xs">Wallet Address</p>
                        <p className="font-mono text-xs break-all">{deposit.wallet_address}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-default-500 text-xs">Submitted</p>
                          <p className="font-semibold text-xs">
                            {new Date(deposit.created_at).toLocaleString()}
                          </p>
                        </div>
                        {deposit.confirmed_at && (
                          <div>
                            <p className="text-default-500 text-xs">Confirmed</p>
                            <p className="font-semibold text-xs">
                              {new Date(deposit.confirmed_at).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Admin Notes */}
                  {deposit.admin_notes && (
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                        Admin Notes
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {deposit.admin_notes}
                      </p>
                    </Card>
                  )}
                </div>

                {/* Right: Payment Proof */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Payment Proof</p>
                  {!deposit.proof_path ? (
                    <div className="border border-default-200 rounded-xl p-8 flex items-center justify-center bg-default-50 h-64">
                      <p className="text-sm text-default-400">No proof uploaded</p>
                    </div>
                  ) : proofUrl ? (
                    <div className="border border-default-200 rounded-xl overflow-hidden bg-default-100 sticky top-0">
                      <img
                        src={proofUrl}
                        alt="Payment proof"
                        className="w-full h-auto max-h-[500px] object-contain"
                      />
                    </div>
                  ) : (
                    <div className="border border-default-200 rounded-xl p-8 flex items-center justify-center bg-default-50 h-64">
                      <p className="text-sm text-default-400">Loading proof...</p>
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
