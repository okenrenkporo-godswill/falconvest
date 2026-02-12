"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Button, Chip, Skeleton, addToast, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select, SelectItem, Tabs, Tab } from "@heroui/react";
import { getAllPools, createPool, updatePool, getAllStakes, getStakingStats } from "@/actions/admin-staking";
import { Plus, Lock, TrendingUp, Edit } from "lucide-react";

type Pool = {
  id: string;
  asset: string;
  name: string;
  apy: number;
  lock_period_days: number;
  min_stake_amount: number;
  total_staked: number;
  total_stakers: number;
  status: string;
};

type Stake = {
  id: string;
  user_id: string;
  user_name: string;
  amount: number;
  apy: number;
  rewards_earned: number;
  status: string;
  staked_at: string;
  unlock_at: string;
  staking_pools: Pool;
};

type Stats = {
  totalPools: number;
  totalStaked: number;
  totalStakers: number;
  activeStakes: number;
  totalRewards: number;
};

export default function AdminStakingPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [poolData, setPoolData] = useState({
    asset: "",
    name: "",
    apy: "",
    lockPeriodDays: "",
    minStakeAmount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("pools");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [poolsData, stakesData, statsData] = await Promise.all([
      getAllPools(),
      getAllStakes(),
      getStakingStats(),
    ]);
    setPools(poolsData);
    setStakes(stakesData);
    setStats(statsData);
    setLoading(false);
  };

  const handleCreatePool = async () => {
    setIsSubmitting(true);
    const result = await createPool({
      asset: poolData.asset,
      name: poolData.name,
      apy: parseFloat(poolData.apy),
      lockPeriodDays: parseInt(poolData.lockPeriodDays),
      minStakeAmount: parseFloat(poolData.minStakeAmount),
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
        description: "Pool created successfully",
        color: "success",
      });
      setIsCreateModalOpen(false);
      setPoolData({ asset: "", name: "", apy: "", lockPeriodDays: "", minStakeAmount: "" });
      loadData();
    }
  };

  const handleOpenEdit = (pool: Pool) => {
    setSelectedPool(pool);
    setPoolData({
      asset: pool.asset,
      name: pool.name,
      apy: pool.apy.toString(),
      lockPeriodDays: pool.lock_period_days.toString(),
      minStakeAmount: pool.min_stake_amount.toString(),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePool = async () => {
    if (!selectedPool) return;

    setIsSubmitting(true);
    const result = await updatePool(selectedPool.id, {
      apy: parseFloat(poolData.apy),
      min_stake_amount: parseFloat(poolData.minStakeAmount),
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
        description: "Pool updated successfully",
        color: "success",
      });
      setIsEditModalOpen(false);
      setSelectedPool(null);
      setPoolData({ asset: "", name: "", apy: "", lockPeriodDays: "", minStakeAmount: "" });
      loadData();
    }
  };

  const handleTogglePool = async (poolId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const result = await updatePool(poolId, { status: newStatus });
    
    if (result.error) {
      addToast({
        title: "Error",
        description: result.error,
        color: "danger",
      });
    } else {
      addToast({
        title: "Success",
        description: `Pool ${newStatus}`,
        color: "success",
      });
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Staking Management</h1>
        <Button
          color="primary"
          startContent={<Plus size={16} />}
          onPress={() => {
            setPoolData({ asset: "", name: "", apy: "", lockPeriodDays: "", minStakeAmount: "" });
            setIsCreateModalOpen(true);
          }}
        >
          Create Pool
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="p-4">
            <p className="text-sm text-default-500">Total Pools</p>
            <p className="text-2xl font-bold">{stats?.totalPools || 0}</p>
          </CardBody>
        </Card>
        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="p-4">
            <p className="text-sm text-default-500">Total Staked</p>
            <p className="text-2xl font-bold">${stats?.totalStaked.toLocaleString() || 0}</p>
          </CardBody>
        </Card>
        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="p-4">
            <p className="text-sm text-default-500">Total Stakers</p>
            <p className="text-2xl font-bold">{stats?.totalStakers || 0}</p>
          </CardBody>
        </Card>
        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="p-4">
            <p className="text-sm text-default-500">Active Stakes</p>
            <p className="text-2xl font-bold">{stats?.activeStakes || 0}</p>
          </CardBody>
        </Card>
        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="p-4">
            <p className="text-sm text-default-500">Total Rewards</p>
            <p className="text-2xl font-bold text-success">${stats?.totalRewards.toLocaleString() || 0}</p>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)}>
        <Tab key="pools" title={`Pools (${pools.length})`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {pools.map((pool) => (
              <Card key={pool.id} className="border-none shadow-sm dark:bg-content1/50">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{pool.asset}</h3>
                      <p className="text-sm text-default-500">{pool.name}</p>
                    </div>
                    <Chip color={pool.status === "active" ? "success" : "default"} variant="flat">
                      {pool.status}
                    </Chip>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-default-500">APY</span>
                      <span className="font-bold text-success">{pool.apy}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-default-500">Lock Period</span>
                      <span className="font-semibold">{pool.lock_period_days} days</span>
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

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      className="flex-1"
                      startContent={<Edit size={16} />}
                      onPress={() => handleOpenEdit(pool)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color={pool.status === "active" ? "danger" : "success"}
                      className="flex-1"
                      onPress={() => handleTogglePool(pool.id, pool.status)}
                    >
                      {pool.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </Tab>

        <Tab key="stakes" title={`Active Stakes (${stakes.filter(s => s.status === "active").length})`}>
          <div className="grid gap-4 mt-4">
            {stakes.filter(s => s.status === "active").map((stake) => (
              <Card key={stake.id} className="border-none shadow-sm dark:bg-content1/50">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Lock className="text-primary" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold">{stake.staking_pools.asset}</h3>
                        <p className="text-sm text-default-500">
                          {stake.user_name}
                        </p>
                        <p className="text-xs text-default-400">
                          ID: {stake.user_id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xs text-default-500 mb-1">Amount</p>
                        <p className="font-bold">{stake.amount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-default-500 mb-1">APY</p>
                        <p className="font-bold text-success">{stake.apy}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-default-500 mb-1">Unlock Date</p>
                        <p className="text-sm">{new Date(stake.unlock_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </Tab>
      </Tabs>

      {/* Create Pool Modal */}
      <Modal isOpen={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create Staking Pool</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Asset Symbol"
                    placeholder="BTC, ETH, SOL..."
                    value={poolData.asset}
                    onValueChange={(value) => setPoolData({ ...poolData, asset: value.toUpperCase() })}
                  />
                  <Input
                    label="Pool Name"
                    placeholder="Bitcoin Flexible Staking"
                    value={poolData.name}
                    onValueChange={(value) => setPoolData({ ...poolData, name: value })}
                  />
                  <Input
                    label="APY (%)"
                    type="number"
                    placeholder="5.5"
                    value={poolData.apy}
                    onValueChange={(value) => setPoolData({ ...poolData, apy: value })}
                  />
                  <Input
                    label="Lock Period (Days)"
                    type="number"
                    placeholder="30, 60, 90..."
                    value={poolData.lockPeriodDays}
                    onValueChange={(value) => setPoolData({ ...poolData, lockPeriodDays: value })}
                  />
                  <Input
                    label="Minimum Stake Amount"
                    type="number"
                    placeholder="0.01"
                    value={poolData.minStakeAmount}
                    onValueChange={(value) => setPoolData({ ...poolData, minStakeAmount: value })}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleCreatePool}
                  isLoading={isSubmitting}
                  startContent={<Plus size={16} />}
                >
                  Create Pool
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Pool Modal */}
      <Modal isOpen={isEditModalOpen} onOpenChange={setIsEditModalOpen} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit Staking Pool</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Asset Symbol"
                    value={poolData.asset}
                    isReadOnly
                    isDisabled
                  />
                  <Input
                    label="Pool Name"
                    value={poolData.name}
                    isReadOnly
                    isDisabled
                  />
                  <Input
                    label="APY (%)"
                    type="number"
                    placeholder="5.5"
                    value={poolData.apy}
                    onValueChange={(value) => setPoolData({ ...poolData, apy: value })}
                  />
                  <Input
                    label="Lock Period (Days)"
                    value={poolData.lockPeriodDays}
                    isReadOnly
                    isDisabled
                  />
                  <Input
                    label="Minimum Stake Amount"
                    type="number"
                    placeholder="0.01"
                    value={poolData.minStakeAmount}
                    onValueChange={(value) => setPoolData({ ...poolData, minStakeAmount: value })}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleUpdatePool}
                  isLoading={isSubmitting}
                  startContent={<Edit size={16} />}
                >
                  Update Pool
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
