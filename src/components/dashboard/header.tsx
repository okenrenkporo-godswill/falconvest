"use client";

import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
    onMenu?: () => void;
}

export function Header({ onMenu }: HeaderProps) {
    return (
        <header className="flex h-14 items-center justify-between border-b bg-background px-3 sm:px-4">
            {/* Left: Logo (visible on mobile) */}
            <Link href="/dashboard" className="flex items-center gap-1.5 lg:hidden">
                <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center relative">
                    <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
                </div>
                <span className="font-semibold text-sm sm:text-base">MasterSync</span>
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
                            <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-xs font-semibold text-white">
                                U
                            </div>
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Profile Actions">
                        <DropdownItem key="profile" className="h-14 gap-2">
                            <p className="font-semibold">Signed in as</p>
                            <p className="font-semibold">user@example.com</p>
                        </DropdownItem>
                        <DropdownItem key="settings" href="/dashboard/account">
                            My Account
                        </DropdownItem>
                        <DropdownItem key="help">Help & Support</DropdownItem>
                        <DropdownItem
                            key="logout"
                            color="danger"
                            onPress={() => {
                                const form = document.createElement("form");
                                form.action = "/api/auth/logout";
                                form.method = "POST";
                                document.body.appendChild(form);
                                form.submit();
                            }}
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
    );
}
