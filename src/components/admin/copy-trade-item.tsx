"use client";

import { Card, CardBody, Chip, Avatar, Button } from "@heroui/react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { CopyTradeResultsModal } from "./copy-trade-results-modal";

type CopyTradeItemProps = {
  copyTrade: {
    id: string;
    trader_id: string;
    copy_amount: number;
    status: string;
    total_profit: number;
    total_trades: number;
    started_at: string;
    stopped_at?: string;
    trader?: {
      display_name: string;
      avatar_url: string | null;
      roi?: number;
      win_rate?: number;
    };
  };
  showActions?: boolean;
  onStop?: (id: string) => void;
  onAddPosition?: (copyTrade: any) => void;
};

export function CopyTradeItem({
  copyTrade,
  showActions = false,
  onStop,
  onAddPosition,
}: CopyTradeItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card shadow="none" className="border-none bg-white dark:bg-zinc-800">
      <CardBody className="p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          {/* Mobile Layout */}
          <div className="sm:hidden">
            <div className="flex items-center gap-2 mb-2">
              <Avatar
                src={copyTrade.trader?.avatar_url || undefined}
                name={copyTrade.trader?.display_name}
                size="sm"
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {copyTrade.trader?.display_name || "Unknown"}
                </p>
                <div className="flex items-center gap-2">
                  <Chip
                    size="sm"
                    variant="flat"
                    color={
                      copyTrade.status === "active" ? "success" : "default"
                    }
                  >
                    {copyTrade.status}
                  </Chip>
                  <span className="text-xs text-default-500">
                    {copyTrade.total_trades} trades
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-bold ${copyTrade.total_profit >= 0 ? "text-success" : "text-danger"}`}
                >
                  {copyTrade.total_profit >= 0 ? "+" : ""}
                  {formatCurrency(copyTrade.total_profit)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button
                size="sm"
                variant="light"
                color="primary"
                className="text-xs h-7 min-w-0 px-2"
                onPress={() => setIsModalOpen(true)}
              >
                View Results
              </Button>
              {showActions && copyTrade.status === "active" && (
                <div className="flex gap-1">
                  {onAddPosition && (
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={() => onAddPosition(copyTrade)}
                      className="h-7 px-2 text-xs"
                    >
                      Add
                    </Button>
                  )}
                  {onStop && (
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      onPress={() => onStop(copyTrade.id)}
                      className="h-7 px-2 text-xs"
                    >
                      Stop
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex sm:items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar
                src={copyTrade.trader?.avatar_url || undefined}
                name={copyTrade.trader?.display_name}
                size="md"
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-semibold truncate">
                    {copyTrade.trader?.display_name || "Unknown Trader"}
                  </p>
                  <Chip
                    size="sm"
                    color={
                      copyTrade.status === "active"
                        ? "success"
                        : copyTrade.status === "paused"
                          ? "warning"
                          : "default"
                    }
                  >
                    {copyTrade.status}
                  </Chip>
                </div>
                <div className="flex items-center gap-4 text-sm text-default-500">
                  <span>Copy: {formatCurrency(copyTrade.copy_amount)}</span>
                  <span>•</span>
                  <span>{copyTrade.total_trades} trades</span>
                  <span>•</span>
                  <span className="text-xs">
                    Started {formatDate(copyTrade.started_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-default-500 mb-1">Total P&L</p>
                <div className="flex items-center gap-1">
                  {copyTrade.total_profit >= 0 ? (
                    <TrendingUp size={16} className="text-success" />
                  ) : (
                    <TrendingDown size={16} className="text-danger" />
                  )}
                  <p
                    className={`font-bold ${copyTrade.total_profit >= 0 ? "text-success" : "text-danger"}`}
                  >
                    {formatCurrency(copyTrade.total_profit)}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="light"
                color="primary"
                onPress={() => setIsModalOpen(true)}
              >
                View Results
              </Button>

              {showActions && copyTrade.status === "active" && (
                <div className="flex gap-2">
                  {onAddPosition && (
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={() => onAddPosition(copyTrade)}
                      className="min-w-0 px-3"
                    >
                      Add Position
                    </Button>
                  )}
                  {onStop && (
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      onPress={() => onStop(copyTrade.id)}
                      className="min-w-0 px-3"
                    >
                      Stop
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardBody>

      <CopyTradeResultsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        copyTradeId={copyTrade.id}
        traderName={copyTrade.trader?.display_name || "Unknown Trader"}
      />
    </Card>
  );
}
