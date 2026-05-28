"use client";

import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Spinner } from "@heroui/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { logoutAction } from "@/actions/auth";

interface HeaderProps {
    onMenu?: () => void;
}

export function Header({ onMenu }: HeaderProps) {
    const [userEmail, setUserEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            setUserEmail(user.email || "");
            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, first_name, avatar_url")
                .eq("id", user.id)
                .single();
            
            setUserName(profile?.full_name || profile?.first_name || "User");
            setAvatarUrl(profile?.avatar_url || "");
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        await logoutAction();
    };

    const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

    return (
        <>
            <header className="flex h-14 items-center justify-between border-b border-divider bg-background px-3 sm:px-4">
                {/* Left: Logo (visible on mobile) */}
                <Link href="/dashboard" className="flex items-center gap-1.5 lg:hidden">
                    <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center relative">
                        <Image src="/images/logo1.png" alt="Logo" fill className="object-contain" />
                    </div>
                    <span className="font-semibold text-sm sm:text-base">Falcon</span>
                </Link>

                {/* Desktop: Spacer */}
                <div className="hidden lg:flex flex-1" />

                {/* Right: Actions */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Notifications - hidden on very small screens */}
                    <Button isIconOnly variant="light" size="sm" className="hidden sm:flex">
                        🔔
                    </Button>

                    {/* Profile Dropdown */}
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Button variant="light" className="gap-2 px-1 sm:px-2 min-w-0" size="sm">
                                {avatarUrl ? (
                                    <img 
                                        src={avatarUrl} 
                                        alt={userName}
                                        className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-xs font-semibold text-white">
                                        {initials}
                                    </div>
                                )}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Profile Actions">
                            <DropdownItem key="profile" className="h-14 gap-2" textValue="User info">
                                <p className="font-semibold">{userName}</p>
                                <p className="text-xs text-default-500">{userEmail}</p>
                            </DropdownItem>
                            <DropdownItem key="settings" href="/dashboard/account">
                                My Account
                            </DropdownItem>
                            <DropdownItem key="help">Help & Support</DropdownItem>
                            <DropdownItem
                                key="logout"
                                color="danger"
                                onPress={handleLogout}
                            >
                                Log Out
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

                    {/* Mobile Menu Button (hamburger on right) */}
                    {onMenu && (
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            className="lg:hidden"
                            onPress={onMenu}
                        >
                            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                    )}
                </div>
            </header>

            {/* Logout Overlay */}
            {loggingOut && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <Spinner size="lg" color="danger" />
                        <p className="text-sm font-medium">Logging out...</p>
                    </div>
                </div>
            )}
        </>
    );
}
