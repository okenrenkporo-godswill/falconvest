"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { useState, useRef, useEffect } from "react";
import { updatePlatformWallet } from "@/actions/wallets";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";

interface EditWalletModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  wallet: {
    id: string;
    symbol: string;
    fullname: string;
    wallet_address: string;
    network: string;
    tag?: string;
    logo_url?: string;
    status: string;
  };
}

export function EditWalletModal({
  isOpen,
  onOpenChange,
  wallet,
}: EditWalletModalProps) {
  const router = useRouter();
  const [symbol, setSymbol] = useState(wallet.symbol);
  const [fullname, setFullname] = useState(wallet.fullname);
  const [address, setAddress] = useState(wallet.wallet_address);
  const [network, setNetwork] = useState(wallet.network);
  const [tag, setTag] = useState(wallet.tag || "");
  const [status, setStatus] = useState(wallet.status);
  const [logo, setLogo] = useState<string | null>(wallet.logo_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when wallet changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setSymbol(wallet.symbol);
      setFullname(wallet.fullname);
      setAddress(wallet.wallet_address);
      setNetwork(wallet.network);
      setTag(wallet.tag || "");
      setStatus(wallet.status);
      setLogo(wallet.logo_url || null);
    }
  }, [isOpen, wallet]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setLogo(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await updatePlatformWallet(wallet.id, {
        symbol: symbol.toUpperCase(),
        fullname,
        walletAddress: address,
        network,
        tag: tag || undefined,
        status,
        logoFile: logo?.startsWith("data:") ? logo : undefined,
      });

      if (result.error) {
        alert("Error: " + result.error);
      } else {
        router.refresh();
        onOpenChange();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Edit Wallet</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Coin Symbol"
                    value={symbol}
                    onValueChange={setSymbol}
                  />

                  <Input
                    label="Full Name"
                    value={fullname}
                    onValueChange={setFullname}
                  />
                </div>

                <Input
                  label="Wallet Address"
                  value={address}
                  onValueChange={setAddress}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Network"
                    value={network}
                    onValueChange={setNetwork}
                  />

                  <Input
                    label="Tag (Optional)"
                    value={tag}
                    onValueChange={setTag}
                  />
                </div>

                <Select
                  label="Status"
                  selectedKeys={[status]}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <SelectItem key="active">Active</SelectItem>
                  <SelectItem key="inactive">Inactive</SelectItem>
                </Select>

                {/* Logo Upload */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Logo</label>
                  {!logo ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-default-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <Upload className="w-8 h-8 text-default-400 mb-2" />
                      <p className="text-sm text-default-600">Click to upload logo</p>
                      <p className="text-xs text-default-400 mt-1">PNG, JPG up to 2MB</p>
                    </div>
                  ) : (
                    <div className="relative border border-default-200 rounded-xl p-4 flex items-center gap-4">
                      <img src={logo} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Logo {logo.startsWith("data:") ? "updated" : "current"}</p>
                        <p className="text-xs text-default-400">Click to change</p>
                      </div>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="danger"
                        onPress={() => setLogo(null)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={isSubmitting}
              >
                Save Changes
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
