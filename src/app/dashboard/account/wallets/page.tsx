"use client";

import { Card, CardBody, Button, useDisclosure } from "@heroui/react";
import { Plus, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserWallets } from "@/actions/wallets";
import { AddWalletModal } from "@/components/account/add-wallet-modal";
import { WalletsList } from "@/components/account/wallets-list";

export default function WalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const fetchWallets = () => {
    setIsLoading(true);
    getUserWallets().then((data) => {
      setWallets(data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Withdrawal Wallets</h1>
          <p className="text-sm text-default-500 mt-1">
            Manage your saved withdrawal addresses
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={18} />}
          onPress={onOpen}
        >
          Add Wallet
        </Button>
      </div>

      <Card className="border-none shadow-sm dark:bg-zinc-900">
        <CardBody className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-default-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : wallets.length === 0 ? (
            <div className="text-center py-12">
              <Wallet size={48} className="mx-auto text-default-300 mb-4" />
              <p className="text-default-500 mb-4">No withdrawal wallets added yet</p>
              <Button
                color="primary"
                variant="flat"
                startContent={<Plus size={18} />}
                onPress={onOpen}
              >
                Add Your First Wallet
              </Button>
            </div>
          ) : (
            <WalletsList wallets={wallets} onUpdate={fetchWallets} />
          )}
        </CardBody>
      </Card>

      <AddWalletModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSuccess={fetchWallets}
      />
    </div>
  );
}
