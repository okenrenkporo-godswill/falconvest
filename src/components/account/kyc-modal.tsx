"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, useDisclosure } from "@heroui/react";
import { useState } from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

interface KycModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    onSubmitted: () => void;
}

export function KycModal({ isOpen, onOpenChange, onSubmitted }: KycModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            onSubmitted();
            onOpenChange();
            setStep(1); // Reset
        }, 2000);
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Identity Verification
                            <span className="text-xs font-normal text-default-500">Complete KYC to unlock full account features.</span>
                        </ModalHeader>
                        <ModalBody>
                            <div className="flex flex-col gap-4">
                                <Input label="Full Name" placeholder="As shown on ID" variant="bordered" />
                                <Input label="ID Number" placeholder="Passport / National ID" variant="bordered" />
                                
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="border-2 border-dashed border-default-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-default-50 transition-colors">
                                        <Upload className="text-default-400" />
                                        <span className="text-xs text-default-500">Upload Front ID</span>
                                    </div>
                                    <div className="border-2 border-dashed border-default-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-default-50 transition-colors">
                                        <Upload className="text-default-400" />
                                        <span className="text-xs text-default-500">Upload Back ID</span>
                                    </div>
                                </div>

                                <div className="bg-blue-500/10 text-blue-500 p-3 rounded-lg text-xs flex items-start gap-2">
                                    <AlertCircle size={16} className="mt-0.5" />
                                    <span>Review typically takes 15-30 minutes. Ensure photos are clear and glare-free.</span>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button color="primary" isLoading={loading} onPress={handleSubmit}>
                                Submit Verification
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
