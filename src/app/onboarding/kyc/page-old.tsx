"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdvancedKycPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  useEffect(() => {
    checkKycStatus();
  }, []);

  const checkKycStatus = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("kyc_status")
        .eq("id", user.id)
        .single();

      setKycStatus(profile?.kyc_status || null);

      if (
        profile?.kyc_status === "auto_verified" ||
        profile?.kyc_status === "manually_verified"
      ) {
        router.push("/dashboard");
        return;
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-full bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-6">
          <div className="flex justify-center">
            <svg
              width="120"
              height="120"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle
                cx="12"
                cy="10"
                r="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 16C8 14.5 9.5 13 12 13C14.5 13 16 14.5 16 16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-tight">
            <div>IDENTITY</div>
            <div>VERIFICATION</div>
          </h1>
          <p className="text-default-600 text-lg">
            Complete your identity verification in just 3 minutes. We'll guide
            you through capturing your ID and taking a selfie.
          </p>
        </div>

        <Button
          color="primary"
          size="lg"
          isLoading={loading}
          onPress={() => router.push("/onboarding/kyc/capture")}
          className="px-12"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
