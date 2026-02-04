"use client";

import Image from "next/image";
import Link from "next/link";
import { Turnstile } from "@marsidev/react-turnstile";
import { env } from "@/env";
import { CaptchaProvider, useCaptcha } from "@/contexts/captcha-context";
import { Divider } from "@heroui/divider";
import { Card, CardBody } from "@heroui/react";

function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  const { captchaToken, setCaptchaToken, turnstileRef } = useCaptcha();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className=" bg-background">
        <div className="w-full max-w-md py-7 mx-auto ">
          <Card isBlurred shadow="none" className="w-full max-w-md">
            <CardBody>
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/images/logo.png"
                  alt="MasterSync"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <span className="text-xl font-bold">MasterSync</span>
              </Link>
            </CardBody>
          </Card>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
        {/* Global CAPTCHA*/}
        {env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
          <div className="relative overflow-hidden w-full max-w-md py-7 mx-auto">
            <Card isBlurred shadow="none" className="w-full max-w-md">
              <CardBody>
                <Turnstile
                  className="border-none"
                  options={{
                    size: "flexible",
                    language: "en",
                  }}
                  ref={turnstileRef}
                  siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setCaptchaToken(token)}
                  onError={() => {
                    setCaptchaToken("bypass-token");
                    console.warn("Turnstile failed, using bypass");
                  }}
                  onExpire={() => {
                    setCaptchaToken(undefined);
                    turnstileRef.current?.reset();
                  }}
                />
              </CardBody>
            </Card>
          </div>
        )}
      </main>

      <Divider />

      {/* Footer */}
      <footer className="bg-background">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="MasterSync"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className="text-sm text-default-600">
                © 2026 MasterSync. All rights reserved.
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
                href="mailto:support@mastersync.live"
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

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CaptchaProvider>
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </CaptchaProvider>
  );
}
