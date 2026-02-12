"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  useDisclosure,
} from "@heroui/react";
import { Eye, DollarSign } from "lucide-react";
import { useState } from "react";
import { TradeOutcomeModal } from "./trade-outcome-modal";

interface Trade {
  id: string;
  user_id: string;
  pair: string;
  side: string;
  type: string;
  amount: number;
  entry_price: number;
  exit_price?: number;
  pnl?: number;
  status: string;
  is_copy_trade: boolean;
  opened_at: string;
  profiles: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

export function TradesTable({ trades }: { trades: Trade[] | null }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const handleSetOutcome = (trade: Trade) => {
    setSelectedTrade(trade);
    onOpen();
  };

  return (
    <>
      <Table aria-label="Trades table">
        <TableHeader>
          <TableColumn>USER</TableColumn>
          <TableColumn>PAIR</TableColumn>
          <TableColumn>SIDE</TableColumn>
          <TableColumn>AMOUNT</TableColumn>
          <TableColumn>ENTRY</TableColumn>
          <TableColumn>EXIT</TableColumn>
          <TableColumn>P&L</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No trades found">
          {(trades || []).map((trade) => (
            <TableRow key={trade.id}>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">
                    {trade.profiles.first_name} {trade.profiles.last_name}
                  </p>
                  {trade.is_copy_trade && (
                    <Chip size="sm" variant="flat" color="warning" className="mt-1">
                      Copy
                    </Chip>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-semibold">{trade.pair}</span>
              </TableCell>
              <TableCell>
                <Chip
                  color={trade.side === "buy" ? "success" : "danger"}
                  variant="flat"
                  size="sm"
                >
                  {trade.side.toUpperCase()}
                </Chip>
              </TableCell>
              <TableCell>{trade.amount}</TableCell>
              <TableCell>${Number(trade.entry_price).toLocaleString()}</TableCell>
              <TableCell>
                {trade.exit_price ? `$${Number(trade.exit_price).toLocaleString()}` : "-"}
              </TableCell>
              <TableCell>
                {trade.pnl ? (
                  <span className={trade.pnl >= 0 ? "text-success" : "text-danger"}>
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                  </span>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <Chip
                  color={trade.status === "open" ? "primary" : "default"}
                  variant="flat"
                  size="sm"
                >
                  {trade.status}
                </Chip>
              </TableCell>
              <TableCell>
                {trade.status === "open" && (
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<DollarSign size={16} />}
                    onPress={() => handleSetOutcome(trade)}
                  >
                    Set Outcome
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedTrade && (
        <TradeOutcomeModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          trade={selectedTrade}
        />
      )}
    </>
  );
}
