"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  Button,
  Chip,
} from "@heroui/react";
import {
  getAllCopyTrades,
  adminStopCopyTrade,
} from "@/actions/admin-copy-trading";
import { adminCreateCopyPosition } from "@/actions/admin-copy-positions";
import { CopyTradeItem } from "./copy-trade-item";
import { Pagination } from "@/components/shared/pagination";
import { Users, TrendingUp, TrendingDown } from "lucide-react";
import { AddCopyTradeResultModal } from "./add-copy-trade-result-modal";

type GroupedCopyTrades = {
  user_id: string;
  user_name: string;
  user_email: string;
  copy_trades: any[];
  total_copy_trades: number;
  active_copy_trades: number;
  total_profit: number;
};

type CopyTradesContentProps = {
  userId?: string;
};

export function CopyTradesContent({ userId }: CopyTradesContentProps) {
  const [groupedData, setGroupedData] = useState<GroupedCopyTrades[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const [selectedCopyTrade, setSelectedCopyTrade] = useState<any>(null);

  const loadData = async (page: number) => {
    setLoading(true);
    const result = await getAllCopyTrades(page, 20, userId);
    setGroupedData(result.groupedData);
    setTotalPages(result.totalPages);
    setLoading(false);
  };

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage, userId]);

  const handleStop = async (copyTradeId: string) => {
    if (!confirm("Are you sure you want to stop this copy trade?")) return;

    const result = await adminStopCopyTrade(copyTradeId);
    if (result.error) {
      alert(result.error);
    } else {
      loadData(currentPage);
    }
  };

  const handleAddPosition = (copyTrade: any) => {
    setSelectedCopyTrade(copyTrade);
    setIsPositionModalOpen(true);
  };

  const handlePositionAdded = () => {
    setIsPositionModalOpen(false);
    setSelectedCopyTrade(null);
    loadData(currentPage);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {!userId && (
          <div>
            <Skeleton className="h-9 w-64 rounded-lg mb-2" />
            <Skeleton className="h-4 w-96 rounded-lg" />
          </div>
        )}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-none shadow-sm dark:bg-zinc-900">
              <CardBody className="p-6 space-y-3">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!userId && (
        <div>
          <h1 className="text-3xl font-bold">Copy Trades</h1>
          <p className="text-sm text-default-500 mt-1">
            Monitor all copy trading activity grouped by users
          </p>
        </div>
      )}

      {groupedData.length === 0 ? (
        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-12 text-center">
            <Users size={48} className="mx-auto text-default-300 mb-4" />
            <p className="text-lg font-semibold mb-2">No Copy Trades</p>
            <p className="text-sm text-default-500">
              No users are currently copying traders
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            {groupedData.map((group) => (
              <Card
                shadow="none"
                key={group.user_id}
                className="border-none dark:bg-zinc-900"
              >
                <CardHeader className="p-4 sm:p-6 pb-4 border-b border-default-200 dark:border-default-100 bg-default-50 dark:bg-default-50/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-bold">
                          {group.user_name}
                        </h3>
                        <Chip size="sm" variant="flat">
                          {group.active_copy_trades} active
                        </Chip>
                      </div>
                      <p className="text-sm text-default-500">
                        {group.user_email}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-default-500 mb-1">Total P&L</p>
                      <div className="flex items-center gap-1">
                        {group.total_profit >= 0 ? (
                          <TrendingUp size={18} className="text-success" />
                        ) : (
                          <TrendingDown size={18} className="text-danger" />
                        )}
                        <p
                          className={`text-xl font-bold ${
                            group.total_profit >= 0
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          {formatCurrency(group.total_profit)}
                        </p>
                      </div>
                      <p className="text-xs text-default-400 mt-1">
                        {group.total_copy_trades} total copy trades
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="p-4 sm:p-6 space-y-3 bg-default-100/50 dark:bg-default-50/5">
                  {group.copy_trades.map((copyTrade) => (
                    <CopyTradeItem
                      key={copyTrade.id}
                      copyTrade={copyTrade}
                      showActions={true}
                      onStop={handleStop}
                      onAddPosition={handleAddPosition}
                    />
                  ))}
                </CardBody>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {isPositionModalOpen && selectedCopyTrade && (
        <AddCopyTradeResultModal
          isOpen={isPositionModalOpen}
          onOpenChange={() => {
            setIsPositionModalOpen(false);
            setSelectedCopyTrade(null);
          }}
          copyTradeId={selectedCopyTrade.id}
          traderName={selectedCopyTrade.trader?.display_name || "Unknown"}
        />
      )}
    </div>
  );
}
