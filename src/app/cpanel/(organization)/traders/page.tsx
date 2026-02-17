"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Skeleton,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  addToast,
} from "@heroui/react";
import {
  getAllTraders,
  approveTrader,
  updateTraderStatus,
} from "@/actions/admin-copy-trading";
import { generateTestTraders } from "@/actions/generate-traders";
import { Check, X, Ban, Plus, Edit } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Pagination } from "@/components/shared/pagination";
import Link from "next/link";

type Trader = {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  status: string;
  total_followers: number;
  total_profit: number;
  win_rate: number;
  total_trades: number;
  risk_score: number | null;
  created_at: string;
};

export default function AdminTradersPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generateCount, setGenerateCount] = useState("10");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadTraders(currentPage);
  }, [currentPage]);

  const loadTraders = async (page: number) => {
    setLoading(true);
    const result = await getAllTraders(page, 15);
    setTraders(result.data);
    setTotalPages(result.totalPages);
    setLoading(false);
  };

  const handleGenerate = async () => {
    const count = parseInt(generateCount);
    if (isNaN(count) || count < 1 || count > 100) {
      addToast({
        title: "Error",
        description: "Please enter a number between 1 and 100",
        color: "danger",
      });
      return;
    }

    setIsGenerating(true);
    const results = await generateTestTraders(count);
    setIsGenerating(false);
    setIsGenerateModalOpen(false);

    if (results.success > 0) {
      addToast({
        title: "Success",
        description: `Generated ${results.success} traders successfully!`,
        color: "success",
      });
      loadTraders(1);
      setCurrentPage(1);
    }
    if (results.failed > 0) {
      addToast({
        title: "Error",
        description: `Failed to create ${results.failed} traders`,
        color: "danger",
      });
    }
  };

  const handleApprove = async (traderId: string) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const result = await approveTrader(traderId, user.id);
    if (result.error) {
      addToast({
        title: "Error",
        description: result.error,
        color: "danger",
      });
    } else {
      addToast({
        title: "Success",
        description: "Trader approved",
        color: "success",
      });
      loadTraders(currentPage);
    }
  };

  const handleSuspend = async (traderId: string) => {
    const result = await updateTraderStatus(traderId, "suspended");
    if (result.error) {
      addToast({
        title: "Error",
        description: result.error,
        color: "danger",
      });
    } else {
      addToast({
        title: "Success",
        description: "Trader suspended",
        color: "success",
      });
      loadTraders(currentPage);
    }
  };

  const handleUnsuspend = async (traderId: string) => {
    const result = await updateTraderStatus(traderId, "active");
    if (result.error) {
      addToast({
        title: "Error",
        description: result.error,
        color: "danger",
      });
    } else {
      addToast({
        title: "Success",
        description: "Trader unsuspended",
        color: "success",
      });
      loadTraders(currentPage);
    }
  };

  const filteredTraders = traders.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className=" space-y-6">
      <div className="flex lg:items-center flex-col lg:flex-row justify-between">
        <h1 className="text-2xl font-bold">Trader Management</h1>
        <div className="flex gap-2 w-fulllg:w-auto justify-start whitespace-nowrap overflow-hidden overflow-x-auto">
          <Button
            as={Link}
            href="/cpanel/traders/create"
            size="sm"
            color="primary"
            startContent={<Plus size={16} />}
          >
            Create Trader
          </Button>
          <Button
            size="sm"
            variant="flat"
            startContent={<Plus size={16} />}
            onPress={() => setIsGenerateModalOpen(true)}
          >
            Generate Traders
          </Button>
          <Button
            size="sm"
            variant={filter === "all" ? "solid" : "flat"}
            onPress={() => setFilter("all")}
          >
            All ({traders.length})
          </Button>
          <Button
            size="sm"
            variant={filter === "pending" ? "solid" : "flat"}
            onPress={() => setFilter("pending")}
          >
            Pending ({traders.filter((t) => t.status === "pending").length})
          </Button>
          <Button
            size="sm"
            variant={filter === "active" ? "solid" : "flat"}
            onPress={() => setFilter("active")}
          >
            Active ({traders.filter((t) => t.status === "active").length})
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTraders.map((trader) => (
          <Card
            shadow="none"
            key={trader.id}
            className="dark:bg-content1/100 border-none bg-default-100"
          >
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <Link
                  href={`/cpanel/traders/${trader.id}`}
                  className="flex items-center gap-4 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                >
                  <Avatar
                    src={trader.avatar_url || undefined}
                    name={trader.display_name}
                    className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 text-white"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">
                      {trader.display_name}
                    </h3>
                    <p className="text-sm text-default-500 truncate">
                      {trader.bio || "No bio"}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-6">
                  <div className="text-center hidden sm:block">
                    <p className="text-sm text-default-500">Followers</p>
                    <p className="font-bold">{trader.total_followers}</p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-sm text-default-500">Profit</p>
                    <p
                      className={`font-bold ${trader.total_profit >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      ${trader.total_profit.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="text-sm text-default-500">Win Rate</p>
                    <p className="font-bold">{trader.win_rate}%</p>
                  </div>
                  <div>
                    <Chip
                      color={
                        trader.status === "active"
                          ? "success"
                          : trader.status === "pending"
                            ? "warning"
                            : "danger"
                      }
                      variant="flat"
                      size="sm"
                    >
                      {trader.status}
                    </Chip>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      as={Link}
                      href={`/cpanel/traders/${trader.id}`}
                      size="sm"
                      variant="flat"
                      isIconOnly
                      className="hidden sm:flex"
                    >
                      <Edit size={16} />
                    </Button>
                    {trader.status === "pending" && (
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        onPress={() => handleApprove(trader.id)}
                        startContent={<Check size={16} />}
                      >
                        Approve
                      </Button>
                    )}
                    {trader.status === "active" && (
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => handleSuspend(trader.id)}
                        startContent={<Ban size={16} />}
                      >
                        Suspend
                      </Button>
                    )}
                    {trader.status === "suspended" && (
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        onPress={() => handleUnsuspend(trader.id)}
                        startContent={<Check size={16} />}
                      >
                        Unsuspend
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}

        {filteredTraders.length === 0 && (
          <Card>
            <CardBody className="text-center py-12 text-default-500">
              No traders found
            </CardBody>
          </Card>
        )}
      </div>

      {/* Generate Traders Modal */}
      <Modal isOpen={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Generate Test Traders</ModalHeader>
              <ModalBody>
                <Input
                  label="Number of Traders"
                  type="number"
                  min="1"
                  max="100"
                  value={generateCount}
                  onValueChange={setGenerateCount}
                  description="Creates users with profiles, balances, and trader accounts"
                />
                <div className="text-sm text-default-500">
                  <p>Each trader will have:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Auth account (email: username@test.com)</li>
                    <li>Profile (KYC verified)</li>
                    <li>USDT balance ($5k-$50k)</li>
                    <li>Random stats and bio</li>
                    <li>Status: Active</li>
                  </ul>
                  <p className="mt-2 text-xs">Password for all: Test123456!</p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleGenerate}
                  isLoading={isGenerating}
                >
                  Generate
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
