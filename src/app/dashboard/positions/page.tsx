"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Button, Chip, Skeleton, addToast } from "@heroui/react";
import { getUserPositions, closePosition } from "@/actions/trading";
import { TrendingUp, TrendingDown, X } from "lucide-react";

type Position = {
  id: string;
  pair: string;
  side: string;
  entry_price: number;
  amount: number;
  leverage: number;
  liquidation_price: number;
  stop_loss: number | null;
  take_profit: number | null;
  unrealized_pnl: number;
  opened_at: string;
};

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    const result = await getUserPositions();
    console.log("Positions result:", result);
    setPositions(result.positions || []);
    setLoading(false);
  };

  const handleClose = async (positionId: string, entryPrice: number) => {
    const result = await closePosition(positionId, entryPrice);
    if (result.error) {
      addToast({
        title: "Error",
        description: result.error,
        color: "danger",
      });
    } else {
      addToast({
        title: "Success",
        description: `Position closed. PnL: $${result.pnl?.toFixed(2)}`,
        color: "success",
      });
      loadPositions();
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <Skeleton className="h-10 w-48" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">My Positions</h1>

      {positions.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-default-500">No open positions</p>
            <Button
              as="a"
              href="/dashboard/trading"
              className="mt-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
            >
              Start Trading
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {positions.map((position) => (
            <Card key={position.id} className="dark:bg-content1/50">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${position.side === "long" ? "bg-success/10" : "bg-danger/10"}`}>
                      {position.side === "long" ? <TrendingUp className="text-success" size={24} /> : <TrendingDown className="text-danger" size={24} />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{position.pair}</h3>
                      <div className="flex gap-2 mt-1">
                        <Chip
                          color={position.side === "long" ? "success" : "danger"}
                          variant="flat"
                          size="sm"
                        >
                          {position.side.toUpperCase()}
                        </Chip>
                        <Chip variant="flat" size="sm">
                          {position.leverage}x
                        </Chip>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm text-default-500">Entry Price</p>
                      <p className="font-bold">${position.entry_price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-default-500">Amount</p>
                      <p className="font-bold">{position.amount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-default-500">Liquidation</p>
                      <p className="font-bold text-danger">${position.liquidation_price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-default-500">Unrealized PnL</p>
                      <p className={`text-xl font-bold ${position.unrealized_pnl >= 0 ? "text-success" : "text-danger"}`}>
                        ${position.unrealized_pnl.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      color="danger"
                      onPress={() => handleClose(position.id, position.entry_price)}
                      startContent={<X size={16} />}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
