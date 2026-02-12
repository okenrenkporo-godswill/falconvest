"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react";
import { useState, useEffect } from "react";
import { Phone, User, Globe } from "lucide-react";
import { updateProfileAction } from "@/actions/account";
import { addToast } from "@heroui/react";

interface EditProfileModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    initialData: {
        name: string;
        email: string;
        phone: string;
        country: string;
    };
    onSave: (data: any) => void;
}

export function EditProfileModal({ isOpen, onOpenChange, initialData, onSave }: EditProfileModalProps) {
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [country, setCountry] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            setFullName(initialData.name);
            setPhone(initialData.phone);
            setCountry(initialData.country);
            setErrors({});
        }
    }, [isOpen, initialData]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        if (!fullName.trim()) newErrors.fullName = "Full name is required";
        if (!country.trim()) newErrors.country = "Country is required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("fullName", fullName);
        formData.append("phone", phone);
        formData.append("country", country);

        const result = await updateProfileAction(formData);
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
                description: "Profile updated successfully",
                color: "success"
            });
            onSave({ name: fullName, phone, country, email: initialData.email });
            onOpenChange();
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Edit Personal Information</ModalHeader>
                        <ModalBody>
                            <div className="flex flex-col gap-4">
                                <Input
                                    label="Full Name"
                                    value={fullName}
                                    onValueChange={setFullName}
                                    startContent={<User size={16} className="text-default-400" />}
                                    variant="bordered"
                                    isInvalid={!!errors.fullName}
                                    errorMessage={errors.fullName}
                                />
                                <Input
                                    label="Phone Number"
                                    value={phone}
                                    onValueChange={setPhone}
                                    startContent={<Phone size={16} className="text-default-400" />}
                                    variant="bordered"
                                    placeholder="+1 234 567 8900"
                                />
                                <Input
                                    label="Country"
                                    value={country}
                                    onValueChange={setCountry}
                                    startContent={<Globe size={16} className="text-default-400" />}
                                    variant="bordered"
                                    isInvalid={!!errors.country}
                                    errorMessage={errors.country}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button color="primary" onPress={handleSubmit} isLoading={loading}>
                                Save Changes
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
