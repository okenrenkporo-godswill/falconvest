"use client";

import { useState } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { User, Shield, ArrowRightLeft, Users, Settings, ChevronRight, ArrowLeft, Wallet } from "lucide-react";
import { ProfileOverview } from "@/components/account/profile-overview";
import { SecuritySettings } from "@/components/account/security-settings";
import { MyAssets } from "@/components/account/my-assets";
import { ReferralDashboard } from "@/components/account/referral-dashboard";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const SECTIONS = [
    { id: "overview", label: "Overview", icon: User, component: ProfileOverview },
    { id: "security", label: "Security", icon: Shield, component: SecuritySettings },
    { id: "transfer", label: "My Assets", icon: ArrowRightLeft, component: MyAssets },
    { id: "wallets", label: "Withdrawal Wallets", icon: Wallet, isLink: true, href: "/dashboard/account/wallets" },
    { id: "referrals", label: "Referrals", icon: Users, component: ReferralDashboard },
];

export default function AccountPage() {
    const [activeSection, setActiveSection] = useState("overview");
    const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
    const searchParams = useSearchParams();

    // Watch for openKyc param changes
    const shouldOpenKyc = searchParams.get("openKyc") === "true";

    const ActiveComponent = SECTIONS.find(s => s.id === activeSection)?.component;

    const handleSectionClick = (id: string) => {
        setActiveSection(id);
        setIsMobileDetailOpen(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleBack = () => {
        setIsMobileDetailOpen(false);
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-background">

            {/* Desktop Sidebar (Hidden on Mobile) */}
            <div className="hidden lg:flex w-64 flex-shrink-0 bg-background border-r border-default-100 dark:border-default-50/10 p-6 flex-col gap-2 sticky top-0 h-[calc(100vh-4rem)] z-20">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Account</h1>
                    <p className="text-sm text-default-500">Manage your profile & settings</p>
                </div>

                {SECTIONS.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    
                    if (section.isLink) {
                        return (
                            <a
                                key={section.id}
                                href={section.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left",
                                    "text-sm font-medium",
                                    "text-default-500 hover:bg-default-100 dark:hover:bg-default-50/10 hover:text-default-900"
                                )}
                            >
                                <Icon size={18} />
                                <span>{section.label}</span>
                            </a>
                        );
                    }
                    
                    return (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left",
                                "text-sm font-medium",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                    : "text-default-500 hover:bg-default-100 dark:hover:bg-default-50/10 hover:text-default-900"
                            )}
                        >
                            <Icon size={18} />
                            <span>{section.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Mobile Navigation (List View) - Hidden on Desktop or when Detail is open */}
            <div className={cn("lg:hidden p-4 flex flex-col gap-4", isMobileDetailOpen ? "hidden" : "flex")}>
                <h1 className="text-2xl font-bold mb-2">Account</h1>

                {/* Profile Card Summary */}
                <ProfileOverview openKycModal={shouldOpenKyc} />

                <div className="grid gap-3 mt-2">
                    {SECTIONS.filter(s => s.id !== "overview").map((section) => {
                        const Icon = section.icon;
                        return (
                            <Card
                                key={section.id}
                                isPressable
                                onPress={() => handleSectionClick(section.id)}
                                className="border-none shadow-sm dark:bg-zinc-900"
                            >
                                <CardBody className="flex flex-row items-center justify-between p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-default-100 dark:bg-zinc-800 rounded-lg text-default-600">
                                            <Icon size={20} />
                                        </div>
                                        <span className="font-semibold">{section.label}</span>
                                    </div>
                                    <ChevronRight size={20} className="text-default-400" />
                                </CardBody>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Content Area (Desktop + Mobile Detail View) */}
            <div className={cn(
                "flex-1 p-0 lg:p-8 max-w-5xl mx-auto w-full",
                // On mobile: Only show if detail is open. On desktop: Always show.
                !isMobileDetailOpen ? "hidden lg:block" : "block"
            )}>

                {/* Mobile Back Button Header */}
                <div className="lg:hidden flex items-center gap-3 p-4 bg-background/80 backdrop-blur-md sticky top-0 z-30 border-b border-default-100">
                    <Button isIconOnly variant="light" onPress={handleBack}>
                        <ArrowLeft size={20} />
                    </Button>
                    <span className="font-bold text-lg">{SECTIONS.find(s => s.id === activeSection)?.label}</span>
                </div>

                <div className="p-4 lg:p-0 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="hidden lg:block mb-2">
                        <h1 className="text-xl font-bold">{SECTIONS.find(s => s.id === activeSection)?.label}</h1>
                    </div>

                    {ActiveComponent ? (
                        <ActiveComponent openKycModal={shouldOpenKyc} />
                    ) : (
                        <Card className="border-none shadow-md dark:bg-zinc-900">
                            <CardBody className="p-12 text-center text-default-500">
                                <Settings size={48} className="mx-auto mb-4 opacity-20" />
                                <p>This section is under development.</p>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
