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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  addToast,
} from "@heroui/react";
import { Plus, Edit, Search, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { CreateWalletModal } from "./create-wallet-modal";
import { EditWalletModal } from "./edit-wallet-modal";
import { deletePlatformWallet } from "@/actions/wallets";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const createModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDeleteClick = (wallet: Wallet) => {
    setWalletToDelete(wallet);
    deleteModal.onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!walletToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deletePlatformWallet(walletToDelete.id);
      if (result.error) {
        addToast({ title: "Delete Failed", description: result.error, color: "danger" });
      } else {
        addToast({ title: "Wallet Deleted", description: `${walletToDelete.symbol} wallet has been removed.`, color: "success" });
        router.refresh();
      }
    } catch (err: any) {
      addToast({ title: "Error", description: err.message || "Failed to delete", color: "danger" });
    } finally {
      setIsDeleting(false);
      setWalletToDelete(null);
      deleteModal.onOpenChange();
    }
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
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<Edit size={16} />}
                      onPress={() => handleEdit(wallet)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      isIconOnly
                      onPress={() => handleDeleteClick(wallet)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onOpenChange={deleteModal.onOpenChange} size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-danger">Delete Wallet</span>
              </ModalHeader>
              <ModalBody>
                <p className="text-default-600">
                  Are you sure you want to delete the{" "}
                  <strong>{walletToDelete?.symbol}</strong> ({walletToDelete?.fullname}) wallet?
                </p>
                <p className="text-sm text-danger-400">
                  This action cannot be undone. Users will no longer be able to deposit to this address.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} isDisabled={isDeleting}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={handleDeleteConfirm}
                  isLoading={isDeleting}
                  startContent={!isDeleting ? <Trash2 size={16} /> : undefined}
                >
                  Delete Wallet
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
