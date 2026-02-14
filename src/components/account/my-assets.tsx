"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Button, Skeleton, useDisclosure } from "@heroui/react";
import { ArrowRightLeft, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TransferModal } from "./transfer-modal";

type Balance = {
  asset: string;
  amount: number;
  account_type: string;
};

export function MyAssets() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    loadBalances();
  }, []);

  const loadBalances = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("balances")
      .select("*")
      .eq("user_id", user.id);

    setBalances(data || []);
    setLoading(false);
  };

  const groupedBalances = balances.reduce((acc, balance) => {
    if (!acc[balance.asset]) {
      acc[balance.asset] = { trading: 0, holdings: 0, staking: 0 };
    }
    acc[balance.asset][balance.account_type as keyof typeof acc[string]] = balance.amount;
    return acc;
  }, {} as Record<string, { trading: number; holdings: number; staking: number }>);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  return (
    <>
      <Card className="border-none shadow-md dark:bg-zinc-900">
        <CardBody className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-md font-bold">My Assets</p>
                <p className="text-small text-default-500">View and transfer your assets</p>
              </div>
            </div>
            <Button
              color="primary"
              variant="flat"
              startContent={<ArrowRightLeft size={16} />}
              onPress={onOpen}
            >
              Transfer
            </Button>
          </div>

          <div className="space-y-3">
            {Object.entries(groupedBalances).map(([asset, accounts]) => (
              <Card key={asset} className="border border-default-200 dark:border-default-100">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-lg">{asset}</span>
                    <span className="text-sm text-default-500">
                      Total: {(accounts.trading + accounts.holdings + accounts.staking).toFixed(6)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-default-500 mb-1">Trading</p>
                      <p className="font-semibold">{accounts.trading.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-default-500 mb-1">Holdings</p>
                      <p className="font-semibold">{accounts.holdings.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-default-500 mb-1">Staking</p>
                      <p className="font-semibold">{accounts.staking.toFixed(6)}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}

            {Object.keys(groupedBalances).length === 0 && (
              <div className="text-center py-12 text-default-500">
                <p>No assets yet</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <TransferModal isOpen={isOpen} onOpenChange={onOpenChange} balances={balances} />
    </>
  );
}
