"use client";

import { Card, CardBody, Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, useDisclosure } from "@heroui/react";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { useState } from "react";
import { approveKycAction, rejectKycAction } from "@/actions/admin";
import { addToast } from "@heroui/react";
import Image from "next/image";

interface KycSubmission {
  id: string;
  user_id: string;
  full_name: string;
  id_number: string;
  document_front_url: string;
  document_back_url: string;
  status: string;
  created_at: string;
  profiles: {
    email: string;
    full_name: string;
  };
}

export function KycReviewTable({ submissions, onUpdate }: { submissions: KycSubmission[] | null; onUpdate?: () => void }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleView = (submission: KycSubmission) => {
    setSelectedSubmission(submission);
    onOpen();
  };

  const handleApprove = async (id: string) => {
    setLoading(true);
    const result = await approveKycAction(id);
    setLoading(false);

    if (result.error) {
      addToast({
        title: "Error",
        description: result.error,
        color: "danger"
      });
    } else {
      addToast({
        title: "Success",
        description: "KYC approved successfully",
        color: "success"
      });
      onOpenChange();
      onUpdate?.();
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      addToast({
        title: "Error",
        description: "Please provide a rejection reason",
        color: "danger"
      });
      return;
    }

    setLoading(true);
    const result = await rejectKycAction(id, rejectReason);
    setLoading(false);

    if (result.error) {
      addToast({
        title: "Error",
        description: result.error,
        color: "danger"
      });
    } else {
      addToast({
        title: "Success",
        description: "KYC rejected",
        color: "success"
      });
      setRejectReason("");
      onOpenChange();
      onUpdate?.();
    }
  };

  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-default-500">No KYC submissions found</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {submissions.map((submission) => (
          <Card key={submission.id}>
            <CardBody>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{submission.profiles.full_name || submission.full_name}</h3>
                    <Chip
                      size="sm"
                      color={
                        submission.status === "manually_verified" ? "success" :
                        submission.status === "rejected" ? "danger" :
                        "warning"
                      }
                    >
                      {submission.status}
                    </Chip>
                  </div>
                  <div className="text-sm text-default-500 space-y-1">
                    <p>Email: {submission.profiles.email}</p>
                    <p>ID Number: {submission.id_number}</p>
                    <p>Submitted: {new Date(submission.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<Eye size={16} />}
                    onPress={() => handleView(submission)}
                  >
                    Review
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                KYC Review - {selectedSubmission?.profiles.full_name}
              </ModalHeader>
              <ModalBody>
                {selectedSubmission && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-default-500">Full Name</p>
                        <p className="font-semibold">{selectedSubmission.full_name}</p>
                      </div>
                      <div>
                        <p className="text-default-500">ID Number</p>
                        <p className="font-semibold">{selectedSubmission.id_number}</p>
                      </div>
                      <div>
                        <p className="text-default-500">Email</p>
                        <p className="font-semibold">{selectedSubmission.profiles.email}</p>
                      </div>
                      <div>
                        <p className="text-default-500">Status</p>
                        <Chip size="sm" color={
                          selectedSubmission.status === "manually_verified" ? "success" :
                          selectedSubmission.status === "rejected" ? "danger" :
                          "warning"
                        }>
                          {selectedSubmission.status}
                        </Chip>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold mb-2">Front ID</p>
                        <div className="relative w-full h-64 bg-default-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {selectedSubmission.document_front_url ? (
                            <Image
                              src={selectedSubmission.document_front_url}
                              alt="Front ID"
                              fill
                              className="object-contain"
                            />
                          ) : (
                            <div className="text-center p-4">
                              <p className="text-default-400">No front document uploaded</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-2">Back ID</p>
                        <div className="relative w-full h-64 bg-default-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {selectedSubmission.document_back_url ? (
                            <Image
                              src={selectedSubmission.document_back_url}
                              alt="Back ID"
                              fill
                              className="object-contain"
                            />
                          ) : (
                            <div className="text-center p-4">
                              <p className="text-default-400">No back document uploaded</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedSubmission.status === "pending" && (
                      <div className="space-y-3">
                        <Input
                          label="Rejection Reason (optional)"
                          placeholder="Enter reason if rejecting..."
                          value={rejectReason}
                          onValueChange={setRejectReason}
                        />
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                {selectedSubmission?.status === "pending" && (
                  <>
                    <Button
                      color="danger"
                      variant="flat"
                      startContent={<XCircle size={16} />}
                      onPress={() => handleReject(selectedSubmission.id)}
                      isLoading={loading}
                    >
                      Reject
                    </Button>
                    <Button
                      color="success"
                      startContent={<CheckCircle size={16} />}
                      onPress={() => handleApprove(selectedSubmission.id)}
                      isLoading={loading}
                    >
                      Approve
                    </Button>
                  </>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
