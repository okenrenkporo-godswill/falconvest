"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Chip,
  Divider,
} from "@heroui/react";
import { useState } from "react";
import { CheckCircle, XCircle, User, Wallet, Network, Clock, DollarSign } from "lucide-react";
import { processWithdrawal } from "@/actions/withdrawals";
import { useRouter } from "next/navigation";

interface WithdrawalActionModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  withdrawal: {
    id: string;
    coin: string;
    amount: number;
    usd_value: number;
    destination_address: string;
    network: string;
    account_type: string;
    status: string;
    requested_at: string;
    profiles: {
      email: string;
      first_name: string;
      last_name: string;
    };
  };
}

export function WithdrawalActionModal({
  isOpen,
  onOpenChange,
  withdrawal,
}: WithdrawalActionModalProps) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAction = async (action: "approve" | "reject") => {
    setIsSubmitting(true);
    try {
      const result = await processWithdrawal(withdrawal.id, action, notes);
      if (result.success) {
        onOpenChange();
        // Trigger parent refresh
        window.dispatchEvent(new Event('withdrawal-updated'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColors: Record<string, "warning" | "success" | "danger"> = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent className="max-h-[90vh]">
        {(onClose) => (
          <>
            <ModalHeader>
              <div>
                <h3 className="text-xl font-bold">Process Withdrawal</h3>
                <p className="text-sm text-default-500 font-normal">
                  Review and approve or reject withdrawal request
                </p>
              </div>
            </ModalHeader>
            <ModalBody className="overflow-y-auto">
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <Chip
                    color={statusColors[withdrawal.status] || "default"}
                    variant="flat"
                    size="lg"
                  >
                    {withdrawal.status.toUpperCase()}
                  </Chip>
                  <p className="text-sm text-default-500">
                    {new Date(withdrawal.requested_at).toLocaleString()}
                  </p>
                </div>

                <Divider />

                {/* User Info */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User size={18} className="text-default-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-default-400">User</p>
                      <p className="font-semibold">
                        {withdrawal.profiles.first_name} {withdrawal.profiles.last_name}
                      </p>
                      <p className="text-sm text-default-500">{withdrawal.profiles.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign size={18} className="text-default-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-default-400">Amount</p>
                      <p className="text-2xl font-bold">
                        {withdrawal.amount} {withdrawal.coin}
                      </p>
                      <p className="text-sm text-default-500">≈ ${withdrawal.usd_value.toFixed(2)} USD</p>
                    </div>
                  </div>

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
                      <p className="text-xs text-default-400">Account Type</p>
                      <p className="text-sm capitalize">{withdrawal.account_type}</p>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Admin Notes */}
                <Textarea
                  label="Admin Notes (Optional)"
                  placeholder="Add notes or rejection reason..."
                  value={notes}
                  onValueChange={setNotes}
                  minRows={3}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              {withdrawal.status === "pending" && (
                <>
                  <Button
                    color="danger"
                    variant="flat"
                    startContent={<XCircle size={18} />}
                    onPress={() => handleAction("reject")}
                    isLoading={isSubmitting}
                  >
                    Reject
                  </Button>
                  <Button
                    color="success"
                    startContent={<CheckCircle size={18} />}
                    onPress={() => handleAction("approve")}
                    isLoading={isSubmitting}
                  >
                    Approve
                  </Button>
                </>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
