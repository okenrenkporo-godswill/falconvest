"use client";

import { Card, CardBody, Skeleton, Chip, Tabs, Tab, Button, addToast, Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from "@heroui/react";
import { useEffect, useState } from "react";
import { getUserDetails } from "@/actions/admin-user-details";
import { approveKycAction, rejectKycAction, suspendUserAccount, reactivateUserAccount } from "@/actions/admin";
import { CopyTradesContent } from "./copy-trades-content";
import { ArrowLeft, User, Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle, Lock, ShieldCheck, Plus, CheckCircle, XCircle, Ban, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AddCopyTradeResultModal } from "./add-copy-trade-result-modal";
import { UpdateBalanceModal } from "./update-balance-modal";
import { getCryptoPrices } from "@/lib/crypto-prices";

export function UserDetailsContent({ userId }: { userId: string }) {
  const [data, setData] = useState<any>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCopyTradeModalOpen, setIsCopyTradeModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [selectedCopyTrade, setSelectedCopyTrade] = useState("");
  const [selectedTraderName, setSelectedTraderName] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    const result = await getUserDetails(userId);
    setData(result);
    if (result?.balances) {
      const assets = Array.from(new Set(result.balances.map((b: any) => b.asset))) as string[];
      const fetchedPrices = await getCryptoPrices(assets);
      setPrices(fetchedPrices);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleApproveKyc = async () => {
    if (!data.kycSubmission) return;
    setActionLoading(true);
    const result = await approveKycAction(data.kycSubmission.id);
    setActionLoading(false);
    
    if (result.error) {
      addToast({ title: "Error", description: result.error, color: "danger" });
    } else {
      addToast({ title: "Success", description: "KYC approved", color: "success" });
      loadData();
    }
  };

  const handleRejectKyc = async () => {
    if (!data.kycSubmission || !rejectReason.trim()) {
      addToast({ title: "Error", description: "Please provide a reason", color: "danger" });
      return;
    }
    setActionLoading(true);
    const result = await rejectKycAction(data.kycSubmission.id, rejectReason);
    setActionLoading(false);
    
    if (result.error) {
      addToast({ title: "Error", description: result.error, color: "danger" });
    } else {
      addToast({ title: "Success", description: "KYC rejected", color: "success" });
      setIsKycModalOpen(false);
      setRejectReason("");
      loadData();
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      addToast({ title: "Error", description: "Please provide a reason", color: "danger" });
      return;
    }
    setActionLoading(true);
    const result = await suspendUserAccount(userId, suspendReason);
    setActionLoading(false);
    
    if (result.error) {
      addToast({ title: "Error", description: result.error, color: "danger" });
    } else {
      addToast({ title: "Success", description: "User suspended", color: "success" });
      setIsSuspendModalOpen(false);
      setSuspendReason("");
      loadData();
    }
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    const result = await reactivateUserAccount(userId);
    setActionLoading(false);
    
    if (result.error) {
      addToast({ title: "Error", description: result.error, color: "danger" });
    } else {
      addToast({ title: "Success", description: "User reactivated", color: "success" });
      loadData();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-none shadow-sm dark:bg-zinc-900">
              <CardBody className="p-4">
                <Skeleton className="h-4 w-24 rounded-lg mb-2" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="text-center py-12">
        <p className="text-default-500">User not found</p>
        <Link href="/cpanel/users">
          <button className="text-primary mt-4">Back to Users</button>
        </Link>
      </div>
    );
  }

  // Calculate total balance using real-time prices
  const totalBalance = data.balances.reduce((sum: number, b: any) => {
    const price = prices[b.asset] || 0;
    const value = Number(b.amount) * price;
    return sum + value;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/cpanel/users">
          <button className="p-2 hover:bg-default-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <Avatar
          src={data.profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${data.profile.full_name || data.profile.email}`}
          className="w-16 h-16"
          isBordered
        />
        <div>
          <h1 className="text-3xl font-bold">{data.profile.full_name || "No Name"}</h1>
          <p className="text-sm text-default-500">{data.profile.email}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wallet size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-default-500">Total Balance</p>
                <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ... (other stats cards unchanged) ... */}
        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp size={20} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-default-500">Total Trades</p>
                <p className="text-2xl font-bold">{data.trades.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Lock size={20} className="text-warning" />
              </div>
              <div>
                <p className="text-sm text-default-500">Active Stakes</p>
                <p className="text-2xl font-bold">{data.stakes.filter((s: any) => s.status === "active").length}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className={`border-none shadow-sm ${data.profile.kyc_status === "manually_verified" || data.profile.kyc_status === "auto_verified"
          ? "bg-success-50 dark:bg-success-900/20"
          : "bg-warning-50 dark:bg-warning-900/20"
          }`}>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${data.profile.kyc_status === "manually_verified" || data.profile.kyc_status === "auto_verified"
                ? "bg-success/10"
                : "bg-warning/10"
                } rounded-lg`}>
                <ShieldCheck size={20} className={
                  data.profile.kyc_status === "manually_verified" || data.profile.kyc_status === "auto_verified"
                    ? "text-success"
                    : "text-warning"
                } />
              </div>
              <div>
                <p className="text-sm text-default-500">KYC Status</p>
                <Chip
                  size="sm"
                  color={
                    data.profile.kyc_status === "manually_verified" || data.profile.kyc_status === "auto_verified"
                      ? "success"
                      : data.profile.kyc_status === "pending"
                        ? "warning"
                        : "danger"
                  }
                >
                  {data.profile.kyc_status || "unverified"}
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Profile Info */}
      <Card className="border-none shadow-sm dark:bg-zinc-900">
        <CardBody className="p-6">
          <h2 className="text-lg font-bold mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-default-500">Full Name</p>
              <p className="font-semibold">{data.profile.full_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Email</p>
              <p className="font-semibold">{data.profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Phone</p>
              <p className="font-semibold">{data.profile.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Country</p>
              <p className="font-semibold">{data.profile.country || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Joined</p>
              <p className="font-semibold">{new Date(data.profile.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Role</p>
              <Chip size="sm" color="primary">{data.profile.role}</Chip>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Admin Actions */}
      <Card className="border-none shadow-sm dark:bg-zinc-900">
        <CardBody className="p-6">
          <h2 className="text-lg font-bold mb-4">Admin Actions</h2>
          <div className="flex flex-wrap gap-3">
            {/* KYC Actions */}
            {data.kycSubmission && data.profile.kyc_status === "pending" && (
              <>
                <Button
                  color="success"
                  startContent={<CheckCircle size={16} />}
                  onPress={handleApproveKyc}
                  isLoading={actionLoading}
                >
                  Approve KYC
                </Button>
                <Button
                  color="danger"
                  variant="flat"
                  startContent={<XCircle size={16} />}
                  onPress={() => setIsKycModalOpen(true)}
                >
                  Reject KYC
                </Button>
              </>
            )}

            {/* Account Status Actions */}
            {data.profile.account_status === "suspended" ? (
              <Button
                color="success"
                variant="flat"
                startContent={<CheckCircle size={16} />}
                onPress={handleReactivate}
                isLoading={actionLoading}
              >
                Reactivate Account
              </Button>
            ) : (
              <Button
                color="warning"
                variant="flat"
                startContent={<Ban size={16} />}
                onPress={() => setIsSuspendModalOpen(true)}
              >
                Suspend Account
              </Button>
            )}

            {/* View KYC Documents */}
            {data.kycSubmission && (
              <Button
                variant="flat"
                startContent={<Eye size={16} />}
                onPress={() => {
                  const element = document.getElementById("kyc-documents");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                View KYC Documents
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* KYC Documents */}
      {data.kycSubmission && (
        <Card id="kyc-documents" className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-6">
            <h2 className="text-lg font-bold mb-4">KYC Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-default-500 mb-2">ID Number</p>
                <p className="font-semibold">{data.kycSubmission.id_number}</p>
              </div>
              <div>
                <p className="text-sm text-default-500 mb-2">Submitted</p>
                <p className="font-semibold">{new Date(data.kycSubmission.created_at).toLocaleString()}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-default-500 mb-2">Documents</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative h-48 bg-default-100 rounded-lg overflow-hidden">
                    <Image
                      src={data.kycSubmission.document_front_url}
                      alt="Front ID"
                      fill
                      className="object-contain"
                    />
                  </div>
                  {data.kycSubmission.document_back_url && (
                    <div className="relative h-48 bg-default-100 rounded-lg overflow-hidden">
                      <Image
                        src={data.kycSubmission.document_back_url}
                        alt="Back ID"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tabs for detailed data */}
      <Card className="border-none shadow-sm dark:bg-zinc-900">
        <CardBody className="p-0">
          <Tabs aria-label="User data tabs" className="p-4">
            <Tab key="balances" title="Balances">
              <div className="flex justify-between items-center bg-default-50 p-3 rounded-lg mb-4">
                <h3 className="font-semibold">User Balances</h3>
                <Button
                  size="sm"
                  color="primary"
                  startContent={<Plus size={16} />}
                  onPress={() => setIsBalanceModalOpen(true)}
                >
                  Update Balance
                </Button>
              </div>
              <div className="space-y-3">
                {data.balances.length === 0 ? (
                  <p className="text-sm text-default-500 text-center py-8">No balances</p>
                ) : (
                  data.balances.map((balance: any) => {
                    const price = prices[balance.asset] || 0;
                    const usdValue = Number(balance.amount) * price;
                    return (
                      <div key={balance.id} className="flex justify-between items-center p-3 bg-default-50 dark:bg-default-50/5 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{balance.asset}</p>
                            <span className="text-xs text-default-500">(${price.toLocaleString()})</span>
                          </div>
                          <p className="text-xs text-default-500">{balance.account_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          <p className="text-xs text-default-500">{Number(balance.amount).toFixed(8)} {balance.asset}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </Tab>

            <Tab key="wallets" title="Wallets">
              <div className="space-y-3 pt-4">
                {data.wallets.length === 0 ? (
                  <p className="text-sm text-default-500 text-center py-8">No wallets</p>
                ) : (
                  data.wallets.map((wallet: any) => (
                    <div key={wallet.id} className="p-3 bg-default-50 dark:bg-default-50/5 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold">{wallet.label}</p>
                        <Chip size="sm" color={wallet.is_verified ? "success" : "warning"}>
                          {wallet.is_verified ? "Verified" : "Unverified"}
                        </Chip>
                      </div>
                      <p className="text-xs text-default-500 break-all">{wallet.address}</p>
                      <p className="text-xs text-default-400 mt-1">{wallet.network}</p>
                    </div>
                  ))
                )}
              </div>
            </Tab>

            <Tab key="trades" title="Trades">
              <div className="space-y-3 pt-4">
                {data.trades.length === 0 ? (
                  <p className="text-sm text-default-500 text-center py-8">No trades</p>
                ) : (
                  data.trades.map((trade: any) => (
                    <div key={trade.id} className="flex justify-between items-center p-3 bg-default-50 dark:bg-default-50/5 rounded-lg">
                      <div>
                        <p className="font-semibold">{trade.pair}</p>
                        <p className="text-xs text-default-500">{new Date(trade.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <Chip size="sm" color={trade.side === "buy" ? "success" : "danger"}>
                          {trade.side}
                        </Chip>
                        <p className="text-xs mt-1">{Number(trade.amount).toFixed(8)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Tab>

            <Tab key="deposits" title="Deposits">
              <div className="space-y-3 pt-4">
                {data.deposits.length === 0 ? (
                  <p className="text-sm text-default-500 text-center py-8">No deposits</p>
                ) : (
                  data.deposits.map((deposit: any) => (
                    <div key={deposit.id} className="flex justify-between items-center p-3 bg-default-50 dark:bg-default-50/5 rounded-lg">
                      <div>
                        <p className="font-semibold">{deposit.amount} {deposit.asset}</p>
                        <p className="text-xs text-default-500">{new Date(deposit.created_at).toLocaleString()}</p>
                      </div>
                      <Chip
                        size="sm"
                        color={
                          deposit.status === "confirmed" ? "success" :
                            deposit.status === "pending" ? "warning" : "danger"
                        }
                      >
                        {deposit.status}
                      </Chip>
                    </div>
                  ))
                )}
              </div>
            </Tab>

            <Tab key="withdrawals" title="Withdrawals">
              <div className="space-y-3 pt-4">
                {data.withdrawals.length === 0 ? (
                  <p className="text-sm text-default-500 text-center py-8">No withdrawals</p>
                ) : (
                  data.withdrawals.map((withdrawal: any) => (
                    <div key={withdrawal.id} className="flex justify-between items-center p-3 bg-default-50 dark:bg-default-50/5 rounded-lg">
                      <div>
                        <p className="font-semibold">{withdrawal.amount} {withdrawal.asset}</p>
                        <p className="text-xs text-default-500">{new Date(withdrawal.created_at).toLocaleString()}</p>
                      </div>
                      <Chip
                        size="sm"
                        color={
                          withdrawal.status === "completed" ? "success" :
                            withdrawal.status === "pending" ? "warning" : "danger"
                        }
                      >
                        {withdrawal.status}
                      </Chip>
                    </div>
                  ))
                )}
              </div>
            </Tab>

            <Tab key="stakes" title="Stakes">
              <div className="space-y-3 pt-4">
                {data.stakes.length === 0 ? (
                  <p className="text-sm text-default-500 text-center py-8">No stakes</p>
                ) : (
                  data.stakes.map((stake: any) => (
                    <div key={stake.id} className="p-3 bg-default-50 dark:bg-default-50/5 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{stake.staking_pools?.asset} Pool</p>
                          <p className="text-xs text-default-500">APY: {stake.staking_pools?.apy_rate}%</p>
                        </div>
                        <Chip size="sm" color={stake.status === "active" ? "success" : "default"}>
                          {stake.status}
                        </Chip>
                      </div>
                      <p className="text-sm">Amount: {Number(stake.amount).toFixed(8)}</p>
                      <p className="text-xs text-default-400 mt-1">
                        Staked: {new Date(stake.staked_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Tab>

            <Tab key="copy-trading" title="Copy Trading">
              <div className="pt-4">
                <CopyTradesContent userId={userId} />
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      <AddCopyTradeResultModal
        isOpen={isCopyTradeModalOpen}
        onOpenChange={() => setIsCopyTradeModalOpen(false)}
        copyTradeId={selectedCopyTrade}
        traderName={selectedTraderName}
      />

      <UpdateBalanceModal
        isOpen={isBalanceModalOpen}
        onOpenChange={() => setIsBalanceModalOpen(false)}
        userId={userId}
        existingAssets={data?.balances?.map((b: any) => b.asset) || []}
      />

      {/* Reject KYC Modal */}
      <Modal isOpen={isKycModalOpen} onOpenChange={setIsKycModalOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Reject KYC</ModalHeader>
              <ModalBody>
                <Input
                  label="Rejection Reason"
                  placeholder="Enter reason for rejection"
                  value={rejectReason}
                  onValueChange={setRejectReason}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancel</Button>
                <Button 
                  color="danger" 
                  onPress={handleRejectKyc}
                  isLoading={actionLoading}
                >
                  Reject
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Suspend Account Modal */}
      <Modal isOpen={isSuspendModalOpen} onOpenChange={setIsSuspendModalOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Suspend Account</ModalHeader>
              <ModalBody>
                <Input
                  label="Suspension Reason"
                  placeholder="Enter reason for suspension"
                  value={suspendReason}
                  onValueChange={setSuspendReason}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancel</Button>
                <Button 
                  color="warning" 
                  onPress={handleSuspend}
                  isLoading={actionLoading}
                >
                  Suspend
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
