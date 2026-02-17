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
  Avatar,
} from "@heroui/react";
import { Plus, Edit, Power } from "lucide-react";
import { toggleTraderStatus } from "@/actions/traders";
import Link from "next/link";

interface Trader {
  id: string;
  name: string;
  avatar: string;
  roi: number;
  pnl: number;
  win_rate: number;
  aum: number;
  copiers: number;
  risk_score: number;
  status: string;
}

export function TradersTable({ traders }: { traders: Trader[] | null }) {
  const handleToggleStatus = async (traderId: string) => {
    await toggleTraderStatus(traderId);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">All Traders</h2>
        <Button color="primary" startContent={<Plus size={18} />}>
          Add Trader
        </Button>
      </div>

      <Table aria-label="Traders table">
        <TableHeader>
          <TableColumn>TRADER</TableColumn>
          <TableColumn>ROI</TableColumn>
          <TableColumn>P&L</TableColumn>
          <TableColumn>WIN RATE</TableColumn>
          <TableColumn>AUM</TableColumn>
          <TableColumn>COPIERS</TableColumn>
          <TableColumn>RISK</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No traders found">
          {(traders || []).map((trader) => (
            <TableRow key={trader.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar name={trader.avatar} size="sm" />
                  <p className="font-semibold">{trader.name}</p>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-success font-semibold">+{trader.roi}%</span>
              </TableCell>
              <TableCell>
                <span className="text-success">${trader.pnl.toLocaleString()}</span>
              </TableCell>
              <TableCell>{trader.win_rate}%</TableCell>
              <TableCell>${(trader.aum / 1000000).toFixed(1)}M</TableCell>
              <TableCell>{trader.copiers}</TableCell>
              <TableCell>
                <Chip
                  color={trader.risk_score <= 3 ? "success" : trader.risk_score <= 6 ? "warning" : "danger"}
                  variant="flat"
                  size="sm"
                >
                  {trader.risk_score}/10
                </Chip>
              </TableCell>
              <TableCell>
                <Chip
                  color={trader.status === "active" ? "success" : "default"}
                  variant="flat"
                  size="sm"
                >
                  {trader.status}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    as={Link}
                    href={`/cpanel/traders/${trader.id}`}
                    size="sm"
                    variant="flat"
                    startContent={<Edit size={16} />}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color={trader.status === "active" ? "danger" : "success"}
                    startContent={<Power size={16} />}
                    onPress={() => handleToggleStatus(trader.id)}
                  >
                    {trader.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
