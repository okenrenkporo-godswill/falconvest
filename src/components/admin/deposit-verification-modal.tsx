"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Card,
  Chip,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { verifyDeposit } from "@/actions/admin-deposits";
import { getDepositProofUrl } from "@/actions/deposits";
import { useRouter } from "next/navigation";

interface DepositVerificationModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  deposit: {
    id: string;
    user_id: string;
    coin: string;
    amount: number;
    usd_value: number;
    wallet_address: string;
    account_type: string;
    proof_path: string;
    status: string;
    created_at: string;
    profiles: {
      email: string;
      first_name: string;
      last_name: string;
    };
    platform_wallets?: {
      symbol: string;
      fullname: string;
      logo_url?: string;
      network: string;
    };
  };
}

export function DepositVerificationModal({
  isOpen,
  onOpenChange,
  deposit,
}: DepositVerificationModalProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleAction = async (action: "confirm" | "reject") => {
    setIsSubmitting(true);
    try {
      const result = await verifyDeposit(deposit.id, action, notes);
      if (result.success) {
        router.refresh();
        onOpenChange();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="5xl"
      scrollBehavior="inside"
    >
      <ModalContent className="max-h-[90vh]">
        {(onClose) => (
          <>
            <ModalHeader>
              <div>
                <h3 className="text-xl font-bold">Verify Deposit</h3>
                <p className="text-sm text-default-500 font-normal">
                  Review payment proof and confirm deposit
                </p>
              </div>
            </ModalHeader>
            <ModalBody className="overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Deposit Details */}
                <div className="space-y-4">
                  <Card className="bg-default-50 dark:bg-default-100/50 p-4">
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="text-default-500">User</p>
                        <p className="font-semibold">
                          {deposit.profiles.first_name}{" "}
                          {deposit.profiles.last_name}
                        </p>
                        <p className="text-xs text-default-400">
                          {deposit.profiles.email}
                        </p>
                      </div>

                      <div>
                        <p className="text-default-500">Status</p>
                        <Chip
                          color={
                            deposit.status === "pending"
                              ? "warning"
                              : deposit.status === "confirmed"
                                ? "success"
                                : "danger"
                          }
                          size="sm"
                          className="mt-1"
                        >
                          {deposit.status}
                        </Chip>
                      </div>

                      <div>
                        <p className="text-default-500">Coin</p>
                        <div className="flex items-center gap-2 mt-1">
                          {deposit.platform_wallets?.logo_url ? (
                            <img
                              src={deposit.platform_wallets.logo_url}
                              alt={deposit.coin}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-default-100 flex items-center justify-center">
                              <span className="text-xs font-bold">
                                {deposit.coin.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className="font-mono font-semibold">
                            {deposit.coin}
                          </span>
                        </div>
                        {deposit.platform_wallets?.network && (
                          <p className="text-xs text-default-400 mt-1">
                            {deposit.platform_wallets.network}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-default-500">Amount</p>
                        <p className="font-semibold">
                          {deposit.amount} {deposit.coin}
                        </p>
                        <p className="text-xs text-default-400">
                          ≈ ${deposit.usd_value.toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-default-500">Account Type</p>
                        <p className="font-semibold capitalize">
                          {deposit.account_type}
                        </p>
                      </div>

                      <div>
                        <p className="text-default-500">Date</p>
                        <p className="font-semibold">
                          {new Date(deposit.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-default-500">Wallet Address</p>
                        <p className="font-mono text-xs break-all">
                          {deposit.wallet_address}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Admin Notes */}
                  {deposit.status === "pending" && (
                    <Textarea
                      label="Admin Notes (Optional)"
                      placeholder="Add notes about this verification..."
                      value={notes}
                      onValueChange={setNotes}
                      minRows={3}
                    />
                  )}
                </div>

                {/* Right: Payment Proof */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Payment Proof</p>
                  {proofUrl ? (
                    <div className="rounded-xl overflow-hidden sticky top-0 max-h-[400px] flex items-center justify-center">
                      <img
                        src={proofUrl}
                        alt="Payment proof"
                        className="w-full h-full max-h-[400px] object-contain"
                      />
                    </div>
                  ) : (
                    <div className="border border-default-200 rounded-xl p-8 flex items-center justify-center bg-default-50">
                      <p className="text-sm text-default-400">
                        Loading proof...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Close
              </Button>
              {deposit.status === "pending" && (
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
                    onPress={() => handleAction("confirm")}
                    isLoading={isSubmitting}
                  >
                    Confirm & Credit
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
