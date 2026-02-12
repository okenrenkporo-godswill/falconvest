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
  Avatar,
  Input,
} from "@heroui/react";
import { Plus, Edit, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { CreateWalletModal } from "./create-wallet-modal";
import { EditWalletModal } from "./edit-wallet-modal";

interface Wallet {
  id: string;
  symbol: string;
  fullname: string;
  wallet_address: string;
  network: string;
  tag?: string;
  logo_url?: string;
  status: string;
}

export function WalletsTable({ wallets }: { wallets: Wallet[] | null }) {
  const createModal = useDisclosure();
  const editModal = useDisclosure();
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWallets = useMemo(() => {
    if (!searchQuery) return wallets || [];
    return (wallets || []).filter(
      (w) =>
        w.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.wallet_address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [wallets, searchQuery]);

  const handleEdit = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    editModal.onOpen();
  };

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <Input
            placeholder="Search wallets..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={<Search size={18} className="text-default-400" />}
            className="sm:max-w-xs"
          />
          <Button
            color="primary"
            startContent={<Plus size={18} />}
            onPress={createModal.onOpen}
          >
            Add Wallet
          </Button>
        </div>

        <Table aria-label="Wallets table" removeWrapper>
          <TableHeader>
            <TableColumn>COIN</TableColumn>
            <TableColumn>ADDRESS</TableColumn>
            <TableColumn>NETWORK</TableColumn>
            <TableColumn>TAG</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No wallets found">
            {filteredWallets.map((wallet) => (
              <TableRow key={wallet.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {wallet.logo_url ? (
                      <Avatar src={wallet.logo_url} size="sm" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center">
                        <span className="text-xs font-bold">{wallet.symbol}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{wallet.symbol}</p>
                      <p className="text-xs text-default-400">{wallet.fullname}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-mono text-xs">{wallet.wallet_address.slice(0, 30)}...</p>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{wallet.network}</span>
                </TableCell>
                <TableCell>
                  {wallet.tag ? (
                    <span className="text-sm font-mono">{wallet.tag}</span>
                  ) : (
                    <span className="text-default-400 text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    color={wallet.status === "active" ? "success" : "default"}
                    variant="flat"
                    size="sm"
                  >
                    {wallet.status}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<Edit size={16} />}
                    onPress={() => handleEdit(wallet)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateWalletModal isOpen={createModal.isOpen} onOpenChange={createModal.onOpenChange} />
      
      {selectedWallet && (
        <EditWalletModal
          isOpen={editModal.isOpen}
          onOpenChange={editModal.onOpenChange}
          wallet={selectedWallet}
        />
      )}
    </>
  );
}
