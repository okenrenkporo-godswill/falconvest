"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Chip } from "@heroui/react";
import { useState } from "react";
import { KycDetailModal } from "./kyc-detail-modal";

interface KycSubmission {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  kyc_status: string;
  created_at: string;
  kyc_verification_results: Array<{
    status: string;
    face_match_score: number;
    liveness_score: number;
    ocr_confidence_score: number;
    overall_confidence: number;
    created_at: string;
  }>;
}

export function KycReviewTable({ submissions }: { submissions: KycSubmission[] }) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  console.log("KycReviewTable received submissions:", submissions);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "danger";
  };

  const getStatusColor = (status: string) => {
    if (status === "passed") return "success";
    if (status === "manual_review") return "warning";
    return "danger";
  };

  return (
    <>
      <Table aria-label="KYC submissions">
        <TableHeader>
          <TableColumn key="user">User</TableColumn>
          <TableColumn key="email">Email</TableColumn>
          <TableColumn key="status">Status</TableColumn>
          <TableColumn key="face_match">Face Match</TableColumn>
          <TableColumn key="liveness">Liveness</TableColumn>
          <TableColumn key="ocr">OCR</TableColumn>
          <TableColumn key="overall">Overall</TableColumn>
          <TableColumn key="submitted">Submitted</TableColumn>
          <TableColumn key="actions">Actions</TableColumn>
        </TableHeader>
        <TableBody items={submissions} emptyContent="No pending KYC submissions">
          {(sub) => {
            const result = sub.kyc_verification_results?.[0];
            const name = `${sub.first_name || ""} ${sub.last_name || ""}`.trim() || sub.username;

            return (
              <TableRow key={sub.id}>
                <TableCell>{name}</TableCell>
                <TableCell>{sub.email}</TableCell>
                <TableCell>
                  <Chip size="sm" color={getStatusColor(result?.status || "")}>
                    {result?.status || "N/A"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Chip size="sm" color={getScoreColor(result?.face_match_score || 0)}>
                    {result?.face_match_score?.toFixed(0) || "N/A"}%
                  </Chip>
                </TableCell>
                <TableCell>
                  {result?.liveness_score ? (
                    <span className="text-success">✓</span>
                  ) : (
                    <span className="text-danger">✗</span>
                  )}
                </TableCell>
                <TableCell>
                  {result?.ocr_confidence_score?.toFixed(0) || "N/A"}%
                </TableCell>
                <TableCell>
                  <Chip size="sm" color={getScoreColor(result?.overall_confidence || 0)}>
                    {result?.overall_confidence?.toFixed(0) || "N/A"}%
                  </Chip>
                </TableCell>
                <TableCell>
                  {result?.created_at ? new Date(result.created_at).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={() => setSelectedUserId(sub.id)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            );
          }}
        </TableBody>
      </Table>

      {selectedUserId && (
        <KycDetailModal
          isOpen={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
          userId={selectedUserId}
        />
      )}
    </>
  );
}
