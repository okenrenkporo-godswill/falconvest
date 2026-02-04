"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from "@heroui/react";
import { updateKycStatusAction } from "@/actions/admin";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

interface KycSubmission {
  id: string;
  user_id: string;
  document_type: string;
  file_path: string;
  status: string;
  uploaded_at: string;
  profiles: {
    id: string;
    email: string;
    full_name: string;
    username: string;
  };
}

export function KycReviewTable({ submissions }: { submissions: KycSubmission[] }) {
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  async function handleApprove(userId: string) {
    setLoading(userId);
    await updateKycStatusAction({
      userId,
      status: "manually_verified",
    });
    window.location.reload();
  }

  async function handleReject(userId: string) {
    setLoading(userId);
    const reason = prompt("Rejection reason:");
    if (reason) {
      await updateKycStatusAction({
        userId,
        status: "rejected",
        rejectionReason: reason,
      });
      window.location.reload();
    }
    setLoading(null);
  }

  async function getSignedUrl(path: string) {
    const { data } = await supabase.storage
      .from("kyc-documents")
      .createSignedUrl(path, 3600);
    return data?.signedUrl;
  }

  return (
    <Table aria-label="KYC submissions">
      <TableHeader>
        <TableColumn>User</TableColumn>
        <TableColumn>Email</TableColumn>
        <TableColumn>Document</TableColumn>
        <TableColumn>Uploaded</TableColumn>
        <TableColumn>Actions</TableColumn>
      </TableHeader>
      <TableBody>
        {submissions.map((sub) => (
          <TableRow key={sub.id}>
            <TableCell>{sub.profiles.full_name}</TableCell>
            <TableCell>{sub.profiles.email}</TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="light"
                onPress={async () => {
                  const url = await getSignedUrl(sub.file_path);
                  if (url) window.open(url, "_blank");
                }}
              >
                View Document
              </Button>
            </TableCell>
            <TableCell>{new Date(sub.uploaded_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  color="success"
                  onPress={() => handleApprove(sub.user_id)}
                  isLoading={loading === sub.user_id}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  onPress={() => handleReject(sub.user_id)}
                  isDisabled={loading === sub.user_id}
                >
                  Reject
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
