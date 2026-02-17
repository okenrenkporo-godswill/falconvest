"use client";

import { Card, CardBody, Avatar, Chip, Button, Divider, useDisclosure } from "@heroui/react";
import { ShieldCheck, ShieldAlert, Mail, Phone, Copy, Edit3, Globe } from "lucide-react";
import { KycModal } from "./kyc-modal";
import { EditProfileModal } from "./edit-profile-modal";
import { useEffect, useState } from "react";
import { getKycStatus } from "@/actions/kyc";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ProfileOverviewProps {
    openKycModal?: boolean;
}

export function ProfileOverview({ openKycModal }: ProfileOverviewProps) {
    const { isOpen: isKycOpen, onOpen: onKycOpen, onOpenChange: onKycChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditChange } = useDisclosure();
    const router = useRouter();

    const [kycStatus, setKycStatus] = useState<string>("pending");
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        phone: "",
        country: "",
        avatar: ""
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    useEffect(() => {
        if (openKycModal && !isKycOpen) {
            onKycOpen();
            router.push("/dashboard/account");
        }
    }, [openKycModal]);

    const handleKycClose = () => {
        onKycChange();
    };

    const loadUserData = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, first_name, last_name, phone, country, kyc_status, avatar_url")
                .eq("id", user.id)
                .single();

            if (profile) {
                const fullName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
                setUserData({
                    name: fullName || "",
                    email: user.email || "",
                    phone: profile.phone || "",
                    country: profile.country || "",
                    avatar: profile.avatar_url || ""
                });
                setKycStatus(profile.kyc_status || "pending");
            }
        }
        setLoading(false);
    };

    const handleSaveProfile = (newData: any) => {
        setUserData(newData);
    };

    const isVerified = kycStatus === "auto_verified" || kycStatus === "manually_verified";
    const isPending = kycStatus === "pending";

    if (loading) {
        return (
            <Card className="border-none shadow-md dark:bg-zinc-900">
                <CardBody className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-20 w-20 bg-default-200 rounded-full" />
                        <div className="h-4 bg-default-200 rounded w-1/2" />
                    </div>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-md dark:bg-zinc-900 overflow-visible">
            <CardBody className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">

                    {/* User Info */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar
                                src={userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`}
                                className="w-20 h-20 text-large"
                            />
                            <Button isIconOnly size="sm" className="absolute -bottom-1 -right-1 rounded-full bg-default-100 shadow-sm border border-background" onPress={onEditOpen}>
                                <Edit3 size={14} />
                            </Button>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{userData.name || "User"}</h2>
                            <div className="flex items-center gap-2 text-default-500 text-sm mt-1">


                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <Chip
                                    startContent={isVerified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                    variant="flat"
                                    color={isVerified ? "success" : isPending ? "warning" : "danger"}
                                    size="sm"
                                    className="pl-2"
                                >
                                    {isVerified ? "Verified User" : isPending ? "Pending Review" : "Unverified"}
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
                                <p className="text-sm font-medium">{userData.phone || "Not set"}</p>
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
                                <p className="text-sm font-medium">{userData.country || "Not set"}</p>
                            </div>
                        </div>
                        <Button size="sm" variant="light" onPress={onEditOpen}>Change</Button>
                    </div>
                </div>

                <KycModal
                    isOpen={isKycOpen}
                    onOpenChange={handleKycClose}
                    onSubmitted={loadUserData}
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
