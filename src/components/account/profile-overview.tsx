"use client";

import { Card, CardBody, Avatar, Chip, Button, Divider, useDisclosure } from "@heroui/react";
import { ShieldCheck, ShieldAlert, Mail, Phone, Copy, Edit3, Globe } from "lucide-react";
import { KycModal } from "./kyc-modal";
import { EditProfileModal } from "./edit-profile-modal";
import { useState } from "react";

export function ProfileOverview() {
    const { isOpen: isKycOpen, onOpen: onKycOpen, onOpenChange: onKycChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditChange } = useDisclosure();

    const [isVerified, setIsVerified] = useState(false);
    const [userData, setUserData] = useState({
        name: "Alex Morgan",
        email: "alex.morgan@example.com",
        phone: "+1 (555) ***-**88",
        country: "United States"
    });

    const handleSaveProfile = (newData: any) => {
        setUserData(newData);
    };

    return (
        <Card className="border-none shadow-md dark:bg-zinc-900 overflow-visible">
            <CardBody className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">

                    {/* User Info */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar
                                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                                className="w-20 h-20 text-large"
                            />
                            <Button isIconOnly size="sm" className="absolute -bottom-1 -right-1 rounded-full bg-default-100 shadow-sm border border-background" onPress={onEditOpen}>
                                <Edit3 size={14} />
                            </Button>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{userData.name}</h2>
                            <div className="flex items-center gap-2 text-default-500 text-sm mt-1">
                                <span>UID: 8439201</span>
                                <Copy size={12} className="cursor-pointer hover:text-primary" />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <Chip
                                    startContent={isVerified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                    variant="flat"
                                    color={isVerified ? "success" : "warning"}
                                    size="sm"
                                    className="pl-2"
                                >
                                    {isVerified ? "Verified User" : "Unverified"}
                                </Chip>
                                {!isVerified && (
                                    <Button size="sm" variant="light" color="primary" className="h-6 text-xs px-2" onPress={onKycOpen}>
                                        Verify Now
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats / Join Date */}
                    <div className="text-right hidden md:block">
                        <p className="text-default-400 text-xs uppercase font-bold">Member Since</p>
                        <p className="text-lg font-mono">Nov 2024</p>
                        <Button size="sm" variant="flat" className="mt-2" onPress={onEditOpen}>
                            Edit Profile
                        </Button>
                    </div>
                </div>

                <Divider className="my-6" />

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-3 bg-default-50 dark:bg-zinc-800/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-default-400">Email Address</p>
                                <p className="text-sm font-medium">{userData.email}</p>
                            </div>
                        </div>
                        <Button size="sm" variant="light" onPress={onEditOpen}>Change</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-default-50 dark:bg-zinc-800/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <Phone size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-default-400">Phone Number</p>
                                <p className="text-sm font-medium">{userData.phone}</p>
                            </div>
                        </div>
                        <Button size="sm" variant="light" onPress={onEditOpen}>Change</Button>
                    </div>
                    {/* Country Added */}
                    <div className="flex items-center justify-between p-3 bg-default-50 dark:bg-zinc-800/50 rounded-xl md:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <Globe size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-default-400">Country / Region</p>
                                <p className="text-sm font-medium">{userData.country}</p>
                            </div>
                        </div>
                        <Button size="sm" variant="light" onPress={onEditOpen}>Change</Button>
                    </div>
                </div>

                <KycModal
                    isOpen={isKycOpen}
                    onOpenChange={onKycChange}
                    onSubmitted={() => setIsVerified(true)}
                />

                <EditProfileModal
                    isOpen={isEditOpen}
                    onOpenChange={onEditChange}
                    initialData={userData}
                    onSave={handleSaveProfile}
                />
            </CardBody>
        </Card>
    );
}
