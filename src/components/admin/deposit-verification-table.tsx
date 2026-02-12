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
import { DepositVerificationModal } from "./deposit-verification-modal";

interface Deposit {
  id: string;
  user_id: string;
  coin: string;
  amount: number;
  usd_value: number;
  wallet_address: string;
  account_type: string;
  proof_path: string;
  status: string;
  created_at: string;
  profiles: {
    email: string;
    first_name: string;
    last_name: string;
    username: string;
  };
  platform_wallets?: {
    symbol: string;
    fullname: string;
    logo_url?: string;
    network: string;
  };
}

export function DepositVerificationTable({ deposits }: { deposits: Deposit[] | null }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statusColors: Record<string, "warning" | "success" | "danger"> = {
    pending: "warning",
    confirmed: "success",
    rejected: "danger",
  };

  const filteredDeposits = useMemo(() => {
    let filtered = deposits || [];

    if (searchQuery) {
      filtered = filtered.filter(
        (d) =>
          d.profiles.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.profiles.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.profiles.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.coin.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    return filtered;
  }, [deposits, searchQuery, statusFilter]);

  const handleView = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
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
            {["all", "pending", "confirmed", "rejected"].map((status) => (
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

        <Table aria-label="Deposits table" removeWrapper>
          <TableHeader>
            <TableColumn>USER</TableColumn>
            <TableColumn>COIN</TableColumn>
            <TableColumn>AMOUNT</TableColumn>
            <TableColumn>ACCOUNT</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>DATE</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No deposits found">
            {filteredDeposits.map((deposit) => (
              <TableRow key={deposit.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">
                      {deposit.profiles.first_name} {deposit.profiles.last_name}
                    </p>
                    <p className="text-xs text-default-400">{deposit.profiles.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {deposit.platform_wallets?.logo_url ? (
                      <img 
                        src={deposit.platform_wallets.logo_url} 
                        alt={deposit.coin} 
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-default-100 flex items-center justify-center">
                        <span className="text-xs font-bold">{deposit.coin.charAt(0)}</span>
                      </div>
                    )}
                    <span className="font-mono font-semibold">{deposit.coin}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-semibold">{deposit.amount}</p>
                    <p className="text-xs text-default-400">${deposit.usd_value.toFixed(2)}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize text-sm">{deposit.account_type}</span>
                </TableCell>
                <TableCell>
                  <Chip
                    color={statusColors[deposit.status] || "default"}
                    variant="flat"
                    size="sm"
                  >
                    {deposit.status}
                  </Chip>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{new Date(deposit.created_at).toLocaleDateString()}</span>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<Eye size={16} />}
                    onPress={() => handleView(deposit)}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedDeposit && (
        <DepositVerificationModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          deposit={selectedDeposit}
        />
      )}
    </>
  );
}
