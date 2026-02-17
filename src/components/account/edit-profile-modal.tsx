"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Avatar } from "@heroui/react";
import { useState, useEffect } from "react";
import { Phone, User, Globe, Upload } from "lucide-react";
import { updateProfileAction, uploadProfileAvatar } from "@/actions/account";
import { addToast } from "@heroui/react";

interface EditProfileModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    initialData: {
        name: string;
        email: string;
        phone: string;
        country: string;
        avatar?: string;
    };
    onSave: (data: any) => void;
}

export function EditProfileModal({ isOpen, onOpenChange, initialData, onSave }: EditProfileModalProps) {
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [country, setCountry] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            setFullName(initialData.name);
            setPhone(initialData.phone);
            setCountry(initialData.country);
            setAvatarUrl(initialData.avatar || "");
            setErrors({});
        }
    }, [isOpen, initialData]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            addToast({
                title: "File too large",
                description: "File size must be less than 2MB",
                color: "danger",
            });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            const base64Data = base64String.split(",")[1];
            
            setUploading(true);
            const result = await uploadProfileAvatar({
                base64: base64Data,
                size: file.size,
            });
            
            if (result.success && result.avatar_url) {
                setAvatarUrl(result.avatar_url);
                addToast({
                    title: "Success",
                    description: "Avatar uploaded successfully",
                    color: "success",
                });
            } else {
                addToast({
                    title: "Upload failed",
                    description: result.error || "Failed to upload avatar",
                    color: "danger",
                });
            }
            setUploading(false);
        };
        reader.readAsDataURL(file);
    };

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
            onSave({ name: fullName, phone, country, email: initialData.email, avatar: avatarUrl });
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
                                <div className="flex flex-col items-center gap-3">
                                    <Avatar
                                        src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`}
                                        className="w-24 h-24"
                                        isBordered
                                    />
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        startContent={<Upload size={16} />}
                                        onPress={() => document.getElementById("avatar-upload")?.click()}
                                        isLoading={uploading}
                                    >
                                        {uploading ? "Uploading..." : "Upload Avatar"}
                                    </Button>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarUpload}
                                    />
                                </div>
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
