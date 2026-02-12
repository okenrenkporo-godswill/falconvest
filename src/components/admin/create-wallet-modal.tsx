import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { createPlatformWallet } from "@/actions/wallets";
import { useRouter } from "next/navigation";

export function CreateWalletModal({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
}) {
  const router = useRouter();
  const [symbol, setSymbol] = useState("");
  const [fullname, setFullname] = useState("");
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("");
  const [tag, setTag] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!symbol || !fullname || !address || !network) return;

    setIsSubmitting(true);
    try {
      const result = await createPlatformWallet({
        symbol: symbol.toUpperCase(),
        fullname,
        walletAddress: address,
        network,
        tag: tag || undefined,
        logoFile: logo || undefined,
      });

      if (result.error) {
        alert("Error: " + result.error);
      } else {
        router.refresh();
        onOpenChange();
        // Reset form
        setSymbol("");
        setFullname("");
        setAddress("");
        setNetwork("");
        setTag("");
        setLogo(null);
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
            <ModalHeader>Add New Wallet</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Coin Symbol"
                    placeholder="e.g., BTC, ETH, USDT"
                    value={symbol}
                    onValueChange={setSymbol}
                  />

                  <Input
                    label="Full Name"
                    placeholder="e.g., Bitcoin, Ethereum"
                    value={fullname}
                    onValueChange={setFullname}
                  />
                </div>

                <Input
                  label="Wallet Address"
                  value={address}
                  onValueChange={setAddress}
                  placeholder="Enter blockchain address"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Network"
                    value={network}
                    onValueChange={setNetwork}
                    placeholder="e.g., ERC-20, TRC-20"
                  />

                  <Input
                    label="Tag (Optional)"
                    value={tag}
                    onValueChange={setTag}
                    placeholder="For XRP, XLM, etc."
                  />
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Logo (Optional)</label>
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
                        <p className="text-sm font-medium">Logo uploaded</p>
                        <p className="text-xs text-default-400">Ready to save</p>
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
                isDisabled={!symbol || !fullname || !address || !network}
              >
                Create Wallet
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
