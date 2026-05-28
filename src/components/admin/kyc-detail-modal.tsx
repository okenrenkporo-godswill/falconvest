"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip, Textarea, Input, addToast } from "@heroui/react";
import { Alert } from "@heroui/react";
import { useState, useEffect } from "react";
import {
  getKycVerificationDetails,
  approveKycWithOverride,
  rejectKycWithReason,
} from "@/actions/admin";

interface KycDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function KycDetailModal({
  isOpen,
  onClose,
  userId,
}: KycDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadData();
    }
  }, [isOpen, userId]);

  async function loadData() {
    setLoading(true);
    const result = await getKycVerificationDetails(userId);
    console.log("KYC Detail Modal - Full result:", result);
    console.log("Verification data:", result.verification);
    console.log("Document URLs:", result.documentUrls);
    console.log("User profile:", result.userProfile);
    if (result.error) {
      addToast({ title: result.error, color: "danger" });
      onClose();
    } else {
      setData(result);
    }
    setLoading(false);
  }

  async function handleApprove() {
    setSubmitting(true);
    const result = await approveKycWithOverride(userId, notes);
    if (result.error) {
      addToast({ title: result.error, color: "danger" });
    } else {
      addToast({ title: "KYC approved", color: "success" });
      onClose();
      window.location.reload();
    }
    setSubmitting(false);
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      addToast({ title: "Rejection reason required", color: "warning" });
      return;
    }
    setSubmitting(true);
    const result = await rejectKycWithReason(userId, rejectionReason, notes);
    if (result.error) {
      addToast({ title: result.error, color: "danger" });
    } else {
      addToast({ title: "KYC rejected", color: "success" });
      onClose();
      window.location.reload();
    }
    setSubmitting(false);
  }

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "danger";
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalContent>
          <ModalBody className="py-8 text-center">Loading...</ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  if (!data || !data.verification) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalContent>
          <ModalHeader>KYC Verification Review</ModalHeader>
          <ModalBody className="py-8">
            <div className="p-4 rounded-lg bg-warning-50 border border-warning-200 text-warning-800">
              <p className="text-sm font-medium">No verification data found. The user may have submitted documents but verification hasn't been processed yet.</p>
            </div>
            {data?.documentUrls && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-3">Uploaded Documents</p>
                <div className="grid grid-cols-3 gap-3">
                  {data.documentUrls.id_front && (
                    <div>
                      <p className="text-xs text-default-600 mb-1">Front</p>
                      <img
                        src={data.documentUrls.id_front}
                        alt="ID Front"
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  {data.documentUrls.id_back && (
                    <div>
                      <p className="text-xs text-default-600 mb-1">Back</p>
                      <img
                        src={data.documentUrls.id_back}
                        alt="ID Back"
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  {data.documentUrls.selfie && (
                    <div>
                      <p className="text-xs text-default-600 mb-1">Selfie</p>
                      <img
                        src={data.documentUrls.selfie}
                        alt="Selfie"
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  const { verification, documentUrls, userProfile } = data || {};
  const docData = verification?.kyc_document_data?.[0];
  const liveness = verification?.kyc_liveness_checks?.[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          <div>
            <h3 className="text-xl font-bold">KYC Verification Review</h3>
            <p className="text-sm text-default-500 font-normal">
              {userProfile?.first_name} {userProfile?.last_name} (
              {userProfile?.email})
            </p>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Chip
              color={
                verification?.status === "passed"
                  ? "success"
                  : verification?.status === "manual_review"
                    ? "warning"
                    : "danger"
              }
            >
              {verification?.status || "N/A"}
            </Chip>
          </div>

          {/* Scores */}
          <div>
            <p className="text-sm font-medium mb-3">Verification Scores</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-lg p-3 text-center">
                <p className="text-xs text-default-600 mb-1">Face Match</p>
                <Chip
                  color={getScoreColor(verification?.face_match_score || 0)}
                  size="lg"
                >
                  {verification?.face_match_score?.toFixed(0) || 0}%
                </Chip>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-xs text-default-600 mb-1">Liveness</p>
                <Chip
                  color={verification?.liveness_score ? "success" : "danger"}
                  size="lg"
                >
                  {verification?.liveness_score ? "✓ Passed" : "✗ Failed"}
                </Chip>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-xs text-default-600 mb-1">OCR Confidence</p>
                <Chip
                  color={getScoreColor(verification?.ocr_confidence_score || 0)}
                  size="lg"
                >
                  {verification?.ocr_confidence_score?.toFixed(0) || 0}%
                </Chip>
              </div>
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs text-default-600 mb-1">
                Overall Confidence
              </p>
              <Chip
                color={getScoreColor(verification?.overall_confidence || 0)}
                size="lg"
              >
                {verification?.overall_confidence?.toFixed(0) || 0}%
              </Chip>
            </div>
          </div>

          {/* Documents */}
          <div>
            <p className="text-sm font-medium mb-3">Uploaded Documents</p>
            <div className="grid grid-cols-3 gap-3">
              {documentUrls?.id_front && (
                <div>
                  <p className="text-xs text-default-600 mb-1">Front</p>
                  <img
                    src={documentUrls.id_front}
                    alt="ID Front"
                    className="w-full h-32 object-cover rounded border"
                  />
                </div>
              )}
              {documentUrls?.id_back && (
                <div>
                  <p className="text-xs text-default-600 mb-1">Back</p>
                  <img
                    src={documentUrls.id_back}
                    alt="ID Back"
                    className="w-full h-32 object-cover rounded border"
                  />
                </div>
              )}
              {documentUrls?.selfie && (
                <div>
                  <p className="text-xs text-default-600 mb-1">Selfie</p>
                  <img
                    src={documentUrls.selfie}
                    alt="Selfie"
                    className="w-full h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Extracted Data */}
          {docData && (
            <div>
              <p className="text-sm font-medium mb-3">Extracted Data</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-default-600">Name:</span>
                  <span>
                    {docData.given_names} {docData.surname}
                  </span>
                </div>
                {docData.date_of_birth && (
                  <div className="flex justify-between">
                    <span className="text-default-600">Age:</span>
                    <span>{calculateAge(docData.date_of_birth)} years</span>
                  </div>
                )}
                {docData.nationality && (
                  <div className="flex justify-between">
                    <span className="text-default-600">Nationality:</span>
                    <span>{docData.nationality}</span>
                  </div>
                )}
                {docData.document_number && (
                  <div className="flex justify-between">
                    <span className="text-default-600">Document #:</span>
                    <span>{docData.document_number}</span>
                  </div>
                )}
                {docData.gender && (
                  <div className="flex justify-between">
                    <span className="text-default-600">Gender:</span>
                    <span>{docData.gender}</span>
                  </div>
                )}
                {docData.expiry_date && (
                  <div className="flex justify-between">
                    <span className="text-default-600">Expiry:</span>
                    <span>
                      {new Date(docData.expiry_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Liveness */}
          {liveness && (
            <div>
              <p className="text-sm font-medium mb-3">Liveness Check</p>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-default-600">Blink:</span>
                  <span
                    className={
                      liveness.blink_detected ? "text-success" : "text-danger"
                    }
                  >
                    {liveness.blink_detected ? "✓ Detected" : "✗ Not Detected"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-default-600">Smile:</span>
                  <span
                    className={
                      liveness.smile_detected ? "text-success" : "text-danger"
                    }
                  >
                    {liveness.smile_detected ? "✓ Detected" : "✗ Not Detected"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <Textarea
            label="Admin Notes"
            placeholder="Add review notes..."
            value={notes}
            onValueChange={setNotes}
            minRows={3}
          />

          {/* Rejection Reason */}
          <Input
            label="Rejection Reason (if rejecting)"
            placeholder="e.g., Document unclear, face mismatch"
            value={rejectionReason}
            onValueChange={setRejectionReason}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
          <Button
            color="danger"
            onPress={handleReject}
            isLoading={submitting}
            isDisabled={!rejectionReason.trim()}
          >
            Reject
          </Button>
          <Button
            color="success"
            onPress={handleApprove}
            isLoading={submitting}
          >
            Approve
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
