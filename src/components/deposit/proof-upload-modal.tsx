"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card } from "@heroui/react";
import { useState, useRef } from "react";
import { Upload, X, CheckCircle } from "lucide-react";

interface ProofUploadModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  walletAddress: string;
  amount: string;
  accountType: string;
  onSubmit: (proofImage: string) => Promise<void>;
}

export function ProofUploadModal({
  isOpen,
  onOpenChange,
  walletAddress,
  amount,
  accountType,
  onSubmit
}: ProofUploadModalProps) {
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert("File size must be less than 5MB. Please choose a smaller image.");
      event.target.value = ""; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageSrc = e.target?.result as string;
      setProofImage(imageSrc);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(proofImage || "");
      onOpenChange();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to submit deposit proof");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setProofImage(null);
    onOpenChange();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-xl font-bold">Upload Payment Proof</h3>
              <p className="text-sm text-default-500 font-normal">
                Upload screenshot or receipt of your payment
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {/* Payment Details */}
                <Card className="bg-default-50 dark:bg-default-100/50 p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-default-500">Amount:</span>
                      <span className="font-semibold">{amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-500">Account:</span>
                      <span className="font-semibold">{accountType}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-default-500">Wallet:</span>
                      <span className="font-mono text-xs text-right break-all max-w-[200px]">
                        {walletAddress}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Upload Area */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Proof <span className="text-default-400">(Optional)</span></label>
                  {!proofImage ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-default-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <Upload className="w-12 h-12 text-default-400 mb-3" />
                      <p className="text-sm font-medium text-default-700">
                        Click to upload payment proof
                      </p>
                      <p className="text-xs text-default-400 mt-1">
                        PNG, JPG up to 5MB (Optional)
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={proofImage}
                        alt="Payment proof"
                        className="w-full h-64 object-contain rounded-xl border border-default-200"
                      />
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="flat"
                        className="absolute top-2 right-2"
                        onPress={() => setProofImage(null)}
                      >
                        <X size={16} />
                      </Button>
                      <div className="absolute bottom-2 left-2 bg-success/90 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <CheckCircle size={14} />
                        Ready to submit
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> Your deposit will be verified by our team within 1-24 hours. 
                    Make sure the payment proof clearly shows the transaction details.
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={handleClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={isSubmitting}
              >
                Submit for Verification
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
