"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Button, Chip, Skeleton, addToast, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from "@heroui/react";
import { getStakingPools, stakeAssets, getUserStakes, unstakeAssets } from "@/actions/staking";
import { createClient } from "@/lib/supabase/client";
import { Lock, Unlock, Plus } from "lucide-react";
import Link from "next/link";
import { AssetConverter } from "@/components/shared/asset-converter";

type Pool = {
  id: string;
  asset: string;
  name: string;
  apy: number;
  lock_period_days: number;
  min_stake_amount: number;
  max_stake_amount: number | null;
  total_staked: number;
  total_stakers: number;
};

type Stake = {
  id: string;
  pool_id: string;
  amount: number;
  apy: number;
  rewards_earned: number;
  status: string;
  staked_at: string;
  unlock_at: string;
  staking_pools: Pool;
};

export default function StakingPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [otherBalances, setOtherBalances] = useState<{ asset: string; amount: number }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    loadData();
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("first_name, last_name")
      .eq("user_id", user.id)
      .single();

    setUserName(profile ? `${profile.first_name} ${profile.last_name}` : "User");
    setUserEmail(user.email || "");
  };

  const loadData = async () => {
    const [poolsData, stakesData] = await Promise.all([
      getStakingPools(),
      getUserStakes(),
    ]);
    setPools(poolsData);
    setStakes(stakesData);
    setLoading(false);
  };

  const handleOpenStakeModal = async (pool: Pool) => {
    setSelectedPool(pool);
    setIsStakeModalOpen(true);
    
    // Fetch balance
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("balances")
      .select("amount")
      .eq("user_id", user.id)
      .eq("asset", pool.asset)
      .eq("account_type", "staking")
      .maybeSingle();

    setBalance(data?.amount || 0);

    // Fetch other assets for conversion
    const { data: allBalances } = await supabase
      .from("balances")
      .select("asset, amount")
      .eq("user_id", user.id)
      .eq("account_type", "staking")
      .neq("asset", pool.asset)
      .gt("amount", 0);

    setOtherBalances(allBalances || []);
  };

  const handleStake = async () => {
    if (!selectedPool || !stakeAmount) return;

    const amount = parseFloat(stakeAmount);
    if (amount < selectedPool.min_stake_amount) {
      addToast({
        title: "Error",
        description: `Minimum stake is ${selectedPool.min_stake_amount} ${selectedPool.asset}`,
        color: "danger",
      });
      return;
    }

    setIsSubmitting(true);
    const result = await stakeAssets({
      poolId: selectedPool.id,
      amount,
    });
    setIsSubmitting(false);

    if (result.error) {
      addToast({
        title: "Error",
        description: result.error,
        color: "danger",
      });
    } else {
      addToast({
        title: "Success",
        description: `Staked ${amount} ${selectedPool.asset}`,
        color: "success",
      });
      setIsStakeModalOpen(false);
      setStakeAmount("");
      loadData();
    }
  };

  const handleUnstake = async (stakeId: string, asset: string) => {
    const result = await unstakeAssets(stakeId);
    if (result.error) {
      addToast({
        title: "Error",
        description: result.error,
        color: "danger",
      });
    } else {
      addToast({
        title: "Success",
        description: `Unstaked with ${result.rewards?.toFixed(4)} ${asset} rewards`,
        color: "success",
      });
      loadData();
    }
  };

  const calculateCurrentRewards = (stake: Stake) => {
    const daysStaked = Math.floor((new Date().getTime() - new Date(stake.staked_at).getTime()) / (1000 * 60 * 60 * 24));
    return (stake.amount * stake.apy / 100 / 365) * daysStaked;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Staking</h1>
        <p className="text-default-500">Earn rewards by staking your crypto assets</p>
        {userName && (
          <div className="mt-2 text-sm">
            <p className="font-semibold">{userName}</p>
            <p className="text-default-500">{userEmail}</p>
          </div>
        )}
      </div>

      {/* Staking Pools */}
      <div>
        <h2 className="text-xl font-bold mb-4">Available Pools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pools.map((pool) => (
            <Card key={pool.id} className="border-none shadow-sm dark:bg-content1/50">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{pool.asset}</h3>
                    <p className="text-sm text-default-500">{pool.name}</p>
                  </div>
                  <Chip color="success" variant="flat" size="lg">
                    {pool.apy}% APY
                  </Chip>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-default-500">Lock Period</span>
                    <span className="font-semibold">{pool.lock_period_days} days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-default-500">Min Stake</span>
                    <span className="font-semibold">{pool.min_stake_amount} {pool.asset}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-default-500">Total Staked</span>
                    <span className="font-semibold">{pool.total_staked.toLocaleString()} {pool.asset}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-default-500">Stakers</span>
                    <span className="font-semibold">{pool.total_stakers}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                  startContent={<Lock size={16} />}
                  onPress={() => handleOpenStakeModal(pool)}
                >
                  Stake {pool.asset}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        {pools.length === 0 && (
          <Card className="border-none shadow-sm dark:bg-content1/50">
            <CardBody className="text-center py-12 text-default-500">
              No staking pools available
            </CardBody>
          </Card>
        )}
      </div>

      {/* My Stakes */}
      <div>
        <h2 className="text-xl font-bold mb-4">My Stakes</h2>
        <div className="grid gap-4">
          {stakes.filter(s => s.status === "active").map((stake) => {
            const isUnlocked = new Date(stake.unlock_at) <= new Date();
            const currentRewards = calculateCurrentRewards(stake);
            
            return (
              <Card key={stake.id} className="border-none shadow-sm dark:bg-content1/50">
                <CardBody className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${isUnlocked ? "bg-success/10" : "bg-warning/10"}`}>
                        {isUnlocked ? <Unlock className="text-success" size={24} /> : <Lock className="text-warning" size={24} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{stake.staking_pools.asset}</h3>
                          <Chip color={isUnlocked ? "success" : "warning"} variant="flat" size="sm">
                            {isUnlocked ? "Unlocked" : "Locked"}
                          </Chip>
                        </div>
                        <p className="text-sm text-default-500">{stake.staking_pools.name} • {stake.apy}% APY</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xs text-default-500 mb-1">Staked Amount</p>
                        <p className="text-lg font-bold">{stake.amount} {stake.staking_pools.asset}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-default-500 mb-1">Current Rewards</p>
                        <p className="text-lg font-bold text-success">+{currentRewards.toFixed(4)} {stake.staking_pools.asset}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-default-500 mb-1">Unlock Date</p>
                        <p className="text-sm font-semibold">{new Date(stake.unlock_at).toLocaleDateString()}</p>
                      </div>
                      {isUnlocked && (
                        <Button
                          size="sm"
                          color="success"
                          variant="flat"
                          onPress={() => handleUnstake(stake.id, stake.staking_pools.asset)}
                          startContent={<Unlock size={16} />}
                        >
                          Unstake
                        </Button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}

          {stakes.filter(s => s.status === "active").length === 0 && (
            <Card className="border-none shadow-sm dark:bg-content1/50">
              <CardBody className="text-center py-12 text-default-500">
                No active stakes
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Stake Modal */}
      <Modal isOpen={isStakeModalOpen} onOpenChange={setIsStakeModalOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div>
                  <h3 className="text-lg font-bold">Stake {selectedPool?.asset}</h3>
                  <p className="text-sm text-default-500">{selectedPool?.apy}% APY • {selectedPool?.lock_period_days} days lock</p>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-default-100 dark:bg-default-50/10 rounded-lg">
                    <span className="text-sm text-default-500">Available Balance</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{balance} {selectedPool?.asset}</span>
                      <Link href="/dashboard/deposit?account=staking">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          startContent={<Plus size={14} />}
                        >
                          Add Funds
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <AssetConverter
                    targetAsset={selectedPool?.asset || ""}
                    accountType="staking"
                    otherBalances={otherBalances}
                    onConversionComplete={() => handleOpenStakeModal(selectedPool!)}
                  />

                  <Input
                    label="Stake Amount"
                    type="number"
                    value={stakeAmount}
                    onValueChange={setStakeAmount}
                    placeholder={`Min: ${selectedPool?.min_stake_amount}`}
                    description={`Minimum: ${selectedPool?.min_stake_amount} ${selectedPool?.asset}`}
                    endContent={
                      <Button
                        size="sm"
                        variant="flat"
                        className="min-w-12"
                        onPress={() => setStakeAmount(balance.toString())}
                      >
                        Max
                      </Button>
                    }
                    isInvalid={
                      stakeAmount
                        ? parseFloat(stakeAmount) > balance || parseFloat(stakeAmount) < (selectedPool?.min_stake_amount || 0)
                        : false
                    }
                    errorMessage={
                      stakeAmount && parseFloat(stakeAmount) > balance
                        ? "Insufficient balance"
                        : stakeAmount && parseFloat(stakeAmount) < (selectedPool?.min_stake_amount || 0)
                        ? `Minimum is ${selectedPool?.min_stake_amount} ${selectedPool?.asset}`
                        : ""
                    }
                  />
                  <div className="bg-default-100 dark:bg-default-50/10 p-3 rounded-lg text-sm">
                    <p className="text-default-600">
                      Your assets will be locked for {selectedPool?.lock_period_days} days. You'll earn {selectedPool?.apy}% APY during this period.
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleStake}
                  isLoading={isSubmitting}
                  startContent={<Lock size={16} />}
                >
                  Stake Now
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
