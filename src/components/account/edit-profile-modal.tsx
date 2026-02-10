"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@heroui/react";
import { useState } from "react";
import { Mail, Phone, User, Globe } from "lucide-react";

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
    const [formData, setFormData] = useState(initialData);
    const [loading, setLoading] = useState(false);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        setLoading(true);
        // Simulate API
        setTimeout(() => {
            setLoading(false);
            onSave(formData);
            onOpenChange();
        }, 1500);
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Edit Personal Information</ModalHeader>
                        <ModalBody>
                            <div className="flex flex-col gap-3">
                                <Input
                                    label="Full Name"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    startContent={<User size={16} className="text-default-400" />}
                                    variant="flat"
                                    labelPlacement="inside"
                                />
                                <Input
                                    label="Email Address"
                                    value={formData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    startContent={<Mail size={16} className="text-default-400" />}
                                    variant="flat"
                                    labelPlacement="inside"
                                />
                                <Input
                                    label="Phone Number"
                                    value={formData.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    startContent={<Phone size={16} className="text-default-400" />}
                                    variant="flat"
                                    labelPlacement="inside"
                                />
                                <Input
                                    label="Country / Region"
                                    value={formData.country}
                                    onChange={(e) => handleChange("country", e.target.value)}
                                    startContent={<Globe size={16} className="text-default-400" />}
                                    variant="flat"
                                    labelPlacement="inside"
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button color="primary" isLoading={loading} onPress={handleSubmit}>
                                Save Changes
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
