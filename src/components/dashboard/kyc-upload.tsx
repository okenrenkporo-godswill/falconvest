"use client";

import { Button, Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type KycStatus = "pending" | "auto_verified" | "manually_verified" | "rejected";

interface KycUploadProps {
  kycStatus: KycStatus;
  rejectionReason?: string | null;
}

export function KycUpload({ kycStatus, rejectionReason }: KycUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusColors = {
    pending: "warning",
    auto_verified: "success",
    manually_verified: "success",
    rejected: "danger",
  } as const;

  const statusLabels = {
    pending: "Pending Review",
    auto_verified: "Verified",
    manually_verified: "Verified",
    rejected: "Rejected",
  };

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save to database (deprecated - using simplified KYC)
      // Redirect to account page for KYC submission
      window.location.href = "/dashboard/account?openKyc=true";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <h3 className="font-semibold">KYC Verification</h3>
        <Chip color={statusColors[kycStatus]} variant="flat">
          {statusLabels[kycStatus]}
        </Chip>
      </CardHeader>
      <CardBody className="space-y-4">
        {kycStatus === "rejected" && rejectionReason && (
          <div className="p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
            <p className="text-sm text-danger">{rejectionReason}</p>
          </div>
        )}

        {(kycStatus === "pending" || kycStatus === "rejected") && (
          <>
            <p className="text-sm text-default-600">
              Upload a government-issued ID to verify your account
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
            <Button
              color="primary"
              onPress={() => fileInputRef.current?.click()}
              isLoading={uploading}
            >
              {kycStatus === "rejected" ? "Re-upload Document" : "Upload Document"}
            </Button>
            {error && <p className="text-sm text-danger">{error}</p>}
          </>
        )}

        {(kycStatus === "auto_verified" || kycStatus === "manually_verified") && (
          <p className="text-sm text-success">Your account is verified!</p>
        )}
      </CardBody>
    </Card>
  );
}
