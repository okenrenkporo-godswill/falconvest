"use client";

import { Card, CardBody, Button, Chip, useDisclosure } from "@heroui/react";
import { Edit, Trash2, Star } from "lucide-react";
import { useState } from "react";
import { deleteUserWallet } from "@/actions/wallets";
import { addToast } from "@heroui/react";
import { EditWalletModal } from "./edit-wallet-modal";

interface Wallet {
  id: string;
  symbol: string;
  wallet_address: string;
  network: string;
  tag?: string;
  label?: string;
  is_default: boolean;
  status: string;
}

export function WalletsList({ wallets, onUpdate }: { wallets: Wallet[]; onUpdate: () => void }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wallet?")) return;

    setDeletingId(id);
    const result = await deleteUserWallet(id);
    setDeletingId(null);

    if (result.error) {
      addToast({ title: result.error, color: "danger" });
    } else {
      addToast({ title: "Wallet deleted successfully", color: "success" });
      onUpdate();
    }
  };

  return (
    <>
      <div className="space-y-3">
        {wallets.map((wallet) => (
          <Card key={wallet.id} className="border border-default-200 dark:border-default-100">
            <CardBody className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg">{wallet.symbol}</span>
                    {wallet.is_default && (
                      <Chip size="sm" color="warning" variant="flat" startContent={<Star size={12} />}>
                        Default
                      </Chip>
                    )}
                    <Chip size="sm" variant="flat">
                      {wallet.network}
                    </Chip>
                  </div>
                  {wallet.label && (
                    <p className="text-sm text-default-600 mb-1">{wallet.label}</p>
                  )}
                  <p className="text-xs font-mono text-default-500 break-all">
                    {wallet.wallet_address}
                  </p>
                  {wallet.tag && (
                    <p className="text-xs text-default-400 mt-1">
                      Memo/Tag: {wallet.tag}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    isIconOnly
                    onPress={() => handleEdit(wallet)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    isIconOnly
                    onPress={() => handleDelete(wallet.id)}
                    isLoading={deletingId === wallet.id}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {selectedWallet && (
        <EditWalletModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          wallet={selectedWallet}
          onSuccess={onUpdate}
        />
      )}
    </>
  );
}
