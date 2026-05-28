"use client";

import Image from "next/image";
import Link from "next/link";
import {
  User,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Divider,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const firstName = user?.user_metadata?.first_name || "";
  const lastName = user?.user_metadata?.last_name || "";
  const fullName =
    `${firstName} ${lastName}`.trim() || user?.email?.split("@")[0] || "User";
  const username =
    user?.user_metadata?.username || user?.email?.split("@")[0] || "";

  return (
    <div className="min-h-screen grid grid-rows-[auto,auto,1fr] flex-col">
      {/* Header */}
      <header className="bg-background">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/images/logo1.png"
              alt="Falcon"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-xl font-bold">Falcon</span>
          </Link>

          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <div className="cursor-pointer">
                <User
                  name={fullName}
                  description={`@${username}`}
                  avatarProps={{
                    src: `https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`,
                  }}
                />
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu">
              <DropdownItem key="profile" href="/dashboard/account">
                Profile
              </DropdownItem>
              <DropdownItem key="dashboard" href="/dashboard">
                Dashboard
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onPress={handleLogout}>
                Logout
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </header>
      <Divider />

      {/* Main Content */}
      <main className="flex-1 grid min-h-full">{children}</main>
    </div>
  );
}
