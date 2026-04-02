"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardBody, Divider } from "@heroui/react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-background">
        <div className="w-full max-w-md py-7 mx-auto">
          <Card isBlurred shadow="none" className="w-full max-w-md">
            <CardBody>
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/images/logo1.png"
                  alt="SyncTrade"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <span className="text-xl font-bold">SyncTrade</span>
              </Link>
            </CardBody>
          </Card>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      <Divider />

      {/* Footer */}
      <footer className="bg-background">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo1.png"
                alt="SyncTrade"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className="text-sm text-default-600">
                © 2026 SyncTrade. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-sm text-default-600 hover:text-foreground"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-default-600 hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                href="mailto:support@synctrade.live"
                className="text-sm text-default-600 hover:text-foreground"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
