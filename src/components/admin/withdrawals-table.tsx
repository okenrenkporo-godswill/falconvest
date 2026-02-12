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
  Input,
} from "@heroui/react";
import { Eye, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { WithdrawalActionModal } from "./withdrawal-action-modal";

interface Withdrawal {
  id: string;
  user_id: string;
  coin: string;
  amount: number;
  usd_value: number;
  destination_address: string;
  network: string;
  account_type: string;
  status: string;
  requested_at: string;
  profiles: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

export function WithdrawalsTable({
  withdrawals,
}: {
  withdrawals: Withdrawal[] | null;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<Withdrawal | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statusColors: Record<
    string,
    "warning" | "success" | "danger" | "default"
  > = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
  };

  const filteredWithdrawals = useMemo(() => {
    let filtered = withdrawals || [];

    if (searchQuery) {
      filtered = filtered.filter(
        (w) =>
          w.profiles.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.profiles.first_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          w.profiles.last_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          w.coin.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((w) => w.status === statusFilter);
    }

    return filtered;
  }, [withdrawals, searchQuery, statusFilter]);

  const handleView = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    onOpen();
  };

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search by user or coin..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={<Search size={18} className="text-default-400" />}
            className="sm:max-w-xs"
          />
          <div className="flex gap-2">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={statusFilter === status ? "flat" : "light"}
                color={statusFilter === status ? "primary" : "default"}
                onPress={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <Table aria-label="Withdrawals table">
          <TableHeader>
            <TableColumn>USER</TableColumn>
            <TableColumn>COIN</TableColumn>
            <TableColumn>AMOUNT</TableColumn>
            <TableColumn>ACCOUNT</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>DATE</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No withdrawals found">
            {filteredWithdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">
                      {withdrawal.profiles.first_name}{" "}
                      {withdrawal.profiles.last_name}
                    </p>
                    <p className="text-xs text-default-400">
                      {withdrawal.profiles.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono font-semibold">
                    {withdrawal.coin}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-semibold">{withdrawal.amount}</p>
                    <p className="text-xs text-default-400">
                      ${withdrawal.usd_value.toFixed(2)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize text-sm">
                    {withdrawal.account_type}
                  </span>
                </TableCell>
                <TableCell>
                  <Chip
                    color={statusColors[withdrawal.status] || "default"}
                    variant="flat"
                    size="sm"
                  >
                    {withdrawal.status}
                  </Chip>
                </TableCell>
                <TableCell>
                  {new Date(withdrawal.requested_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<Eye size={16} />}
                    onPress={() => handleView(withdrawal)}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedWithdrawal && (
        <WithdrawalActionModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          withdrawal={selectedWithdrawal}
        />
      )}
    </>
  );
}
