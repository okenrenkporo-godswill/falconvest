"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react";
import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle, X } from "lucide-react";
import { submitKycAction } from "@/actions/kyc";
import { addToast } from "@heroui/react";
import Image from "next/image";

interface KycModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    onSubmitted: () => void;
}

export function KycModal({ isOpen, onOpenChange, onSubmitted }: KycModalProps) {
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState("");
    const [idNumber, setIdNumber] = useState("");
    const [frontId, setFrontId] = useState<File | null>(null);
    const [backId, setBackId] = useState<File | null>(null);
    const [frontPreview, setFrontPreview] = useState<string>("");
    const [backPreview, setBackPreview] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const frontInputRef = useRef<HTMLInputElement>(null);
    const backInputRef = useRef<HTMLInputElement>(null);

    const handleFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, frontId: "File size must be less than 5MB" }));
                return;
            }
            setFrontId(file);
            setFrontPreview(URL.createObjectURL(file));
            setErrors(prev => ({ ...prev, frontId: "" }));
        }
    };

    const handleBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, backId: "File size must be less than 5MB" }));
                return;
            }
            setBackId(file);
            setBackPreview(URL.createObjectURL(file));
            setErrors(prev => ({ ...prev, backId: "" }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        if (!fullName.trim()) newErrors.fullName = "Full name is required";
        if (!idNumber.trim()) newErrors.idNumber = "ID number is required";
        if (!frontId) newErrors.frontId = "Front ID image is required";
        if (!backId) newErrors.backId = "Back ID image is required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("fullName", fullName);
        formData.append("idNumber", idNumber);
        formData.append("frontId", frontId!);
        formData.append("backId", backId!);

        const result = await submitKycAction(formData);
        setLoading(false);

        if (result.error) {
            addToast({
                title: "Error",
                description: result.error,
                color: "danger"
            });
        } else {
            addToast({
                title: "Success",
                description: "KYC submitted successfully. Awaiting admin approval.",
                color: "success"
            });
            onSubmitted();
            onOpenChange();
            // Reset form
            setFullName("");
            setIdNumber("");
            setFrontId(null);
            setBackId(null);
            setFrontPreview("");
            setBackPreview("");
            setErrors({});
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Identity Verification
                            <span className="text-xs font-normal text-default-500">Complete KYC to unlock full account features.</span>
                        </ModalHeader>
                        <ModalBody>
                            <div className="flex flex-col gap-4">
                                <Input 
                                    label="Full Name" 
                                    placeholder="As shown on ID" 
                                    variant="bordered"
                                    value={fullName}
                                    onValueChange={setFullName}
                                    isInvalid={!!errors.fullName}
                                    errorMessage={errors.fullName}
                                />
                                <Input 
                                    label="ID Number" 
                                    placeholder="Passport / National ID" 
                                    variant="bordered"
                                    value={idNumber}
                                    onValueChange={setIdNumber}
                                    isInvalid={!!errors.idNumber}
                                    errorMessage={errors.idNumber}
                                />
                                
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="flex flex-col gap-2">
                                        <input
                                            ref={frontInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFrontChange}
                                        />
                                        <div 
                                            onClick={() => frontInputRef.current?.click()}
                                            className={`border-2 border-dashed ${errors.frontId ? 'border-danger' : 'border-default-200'} rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-default-50 transition-colors relative min-h-[150px]`}
                                        >
                                            {frontPreview ? (
                                                <>
                                                    <div className="relative w-full h-32">
                                                        <Image
                                                            src={frontPreview}
                                                            alt="Front ID"
                                                            fill
                                                            className="object-contain rounded"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFrontId(null);
                                                            setFrontPreview("");
                                                        }}
                                                        className="absolute top-2 right-2 p-1 bg-danger/10 rounded-full hover:bg-danger/20"
                                                    >
                                                        <X size={14} className="text-danger" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="text-default-400" />
                                                    <span className="text-xs text-default-500">Upload Front ID</span>
                                                </>
                                            )}
                                        </div>
                                        {errors.frontId && <p className="text-xs text-danger">{errors.frontId}</p>}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <input
                                            ref={backInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleBackChange}
                                        />
                                        <div 
                                            onClick={() => backInputRef.current?.click()}
                                            className={`border-2 border-dashed ${errors.backId ? 'border-danger' : 'border-default-200'} rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-default-50 transition-colors relative min-h-[150px]`}
                                        >
                                            {backPreview ? (
                                                <>
                                                    <div className="relative w-full h-32">
                                                        <Image
                                                            src={backPreview}
                                                            alt="Back ID"
                                                            fill
                                                            className="object-contain rounded"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setBackId(null);
                                                            setBackPreview("");
                                                        }}
                                                        className="absolute top-2 right-2 p-1 bg-danger/10 rounded-full hover:bg-danger/20"
                                                    >
                                                        <X size={14} className="text-danger" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="text-default-400" />
                                                    <span className="text-xs text-default-500">Upload Back ID</span>
                                                </>
                                            )}
                                        </div>
                                        {errors.backId && <p className="text-xs text-danger">{errors.backId}</p>}
                                    </div>
                                </div>

                                <div className="bg-blue-500/10 text-blue-500 p-3 rounded-lg text-xs flex items-start gap-2">
                                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                    <span>Review typically takes 15-30 minutes. Ensure photos are clear and glare-free. Max file size: 5MB per image.</span>
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
