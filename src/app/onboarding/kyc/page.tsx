"use client";

import { Button, Card, CardBody, Chip } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface VerificationData {
  status: string;
  submittedAt: string;
  faceMatchScore?: number;
  livenessScore?: number;
  ocrConfidence?: number;
  overallConfidence?: number;
  verificationStatus?: string;
  documentData?: {
    givenNames?: string;
    surname?: string;
    dateOfBirth?: string;
    nationality?: string;
    documentNumber?: string;
  };
  documents?: {
    front?: string;
    back?: string;
    selfie?: string;
  };
}

export default function AdvancedKycPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [verificationData, setVerificationData] =
    useState<VerificationData | null>(null);
  const [documentUrls, setDocumentUrls] = useState<{
    front?: string;
    back?: string;
    selfie?: string;
  }>({});

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

  useEffect(() => {
    checkKycStatus();

    // Auto-check every 30 seconds
    const interval = setInterval(() => {
      checkKycStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkKycStatus = async () => {
    if (!loading) setChecking(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      console.log("User ID:", user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("kyc_status")
        .eq("id", user.id)
        .single();

      console.log("Profile:", profile);
      setKycStatus(profile?.kyc_status || null);

      // Check if verification has been submitted
      const { data: verificationResult, error: verificationError } =
        await supabase
          .from("kyc_verification_results")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      console.log("Verification result:", verificationResult);
      console.log("Verification error:", verificationError);

      if (verificationResult && !verificationError) {
        console.log("Setting verification data");

        // Get document data
        const { data: documentData } = await supabase
          .from("kyc_document_data")
          .select(
            "given_names, surname, date_of_birth, nationality, document_number",
          )
          .eq("user_id", user.id)
          .maybeSingle();

        console.log("Document data:", documentData);

        // Get submitted documents
        const { data: submissions } = await supabase
          .from("kyc_submissions")
          .select("document_type, file_path")
          .eq("user_id", user.id);

        const documents: any = {};
        submissions?.forEach((sub) => {
          if (sub.document_type === "id_front") documents.front = sub.file_path;
          if (sub.document_type === "id_back") documents.back = sub.file_path;
          if (sub.document_type === "selfie") documents.selfie = sub.file_path;
        });

        setVerificationData({
          status: profile?.kyc_status || "pending",
          submittedAt: verificationResult.created_at,
          faceMatchScore: Number(verificationResult.face_match_score) || 0,
          livenessScore: Number(verificationResult.liveness_score) || 0,
          ocrConfidence: Number(verificationResult.ocr_confidence_score) || 0,
          overallConfidence: Number(verificationResult.overall_confidence) || 0,
          verificationStatus: verificationResult.status,
          documentData: documentData
            ? {
                givenNames: documentData.given_names,
                surname: documentData.surname,
                dateOfBirth: documentData.date_of_birth,
                nationality: documentData.nationality,
                documentNumber: documentData.document_number,
              }
            : undefined,
          documents,
        });

        // Get public URLs for documents
        const urls: any = {};
        if (documents.front) {
          const { data } = supabase.storage
            .from("kyc-documents")
            .getPublicUrl(documents.front);
          urls.front = data.publicUrl;
        }
        if (documents.back) {
          const { data } = supabase.storage
            .from("kyc-documents")
            .getPublicUrl(documents.back);
          urls.back = data.publicUrl;
        }
        if (documents.selfie) {
          const { data } = supabase.storage
            .from("kyc-documents")
            .getPublicUrl(documents.selfie);
          urls.selfie = data.publicUrl;
        }
        setDocumentUrls(urls);
      } else {
        console.log("No verification result found");
      }

      // Redirect if verified
      if (
        profile?.kyc_status === "auto_verified" ||
        profile?.kyc_status === "manually_verified"
      ) {
        router.push("/dashboard");
        return;
      }
    }

    setLoading(false);
    setChecking(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "auto_verified":
      case "manually_verified":
        return "success";
      case "rejected":
        return "danger";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "auto_verified":
        return "Auto Verified";
      case "manually_verified":
        return "Manually Verified";
      case "rejected":
        return "Rejected";
      case "pending":
        return "Under Review";
      default:
        return "Not Started";
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-default-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-6">
          {!verificationData ? (
            <>
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
            </>
          ) : (
            <div className="flex justify-center">
              <svg
                width="120"
                height="120"
                viewBox="0 0 100 100"
                className="text-primary"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.2"
                />

                <line
                  x1="50"
                  y1="50"
                  x2="50"
                  y2="30"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{
                    animation: "rotate 2s linear infinite",
                    transformOrigin: "50px 50px",
                  }}
                />
                <style jsx>{`
                  @keyframes spin {
                    0% {
                      transform: rotate(0deg);
                    }
                    100% {
                      transform: rotate(360deg);
                    }
                  }
                  @keyframes rotate {
                    0% {
                      transform: rotate(0deg);
                    }
                    100% {
                      transform: rotate(360deg);
                    }
                  }
                `}</style>
              </svg>
            </div>
          )}

          {verificationData ? (
            <Card shadow="none" className="border border-default">
              <CardBody className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-600">Status</span>
                  <Chip
                    color={getStatusColor(verificationData.status)}
                    size="sm"
                  >
                    {getStatusLabel(verificationData.status)}
                  </Chip>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-600">Submitted</span>
                  <span className="text-sm">
                    {new Date(
                      verificationData.submittedAt,
                    ).toLocaleDateString()}
                  </span>
                </div>

                {verificationData.faceMatchScore !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-600">Face Match</span>
                    <span className="text-sm">
                      {Math.round(verificationData.faceMatchScore)}%
                    </span>
                  </div>
                )}

                {verificationData.overallConfidence !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-600">
                      Overall Confidence
                    </span>
                    <span className="text-sm">
                      {Math.round(verificationData.overallConfidence)}%
                    </span>
                  </div>
                )}

                {verificationData.documentData && (
                  <>
                    <div className="border-t border-default pt-4 mt-4">
                      <p className="text-xs font-medium text-default-600 mb-3">
                        Document Information
                      </p>
                      {verificationData.documentData.givenNames && (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-default-600">Name</span>
                          <span className="text-xs">
                            {verificationData.documentData.givenNames}{" "}
                            {verificationData.documentData.surname}
                          </span>
                        </div>
                      )}
                      {verificationData.documentData.dateOfBirth && (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-default-600">Age</span>
                          <span className="text-xs">
                            {calculateAge(
                              verificationData.documentData.dateOfBirth,
                            )}{" "}
                            years
                          </span>
                        </div>
                      )}
                      {verificationData.documentData.nationality && (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-default-600">
                            Nationality
                          </span>
                          <span className="text-xs">
                            {verificationData.documentData.nationality}
                          </span>
                        </div>
                      )}
                      {verificationData.documentData.documentNumber && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-default-600">
                            Document #
                          </span>
                          <span className="text-xs">
                            {verificationData.documentData.documentNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {verificationData.documents && (
                  <div className="border-t border-default pt-4 mt-4">
                    <p className="text-xs font-medium text-default-600 mb-3">
                      Uploaded Documents
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {documentUrls.front && (
                        <div>
                          <p className="text-xs text-default-600 mb-1">Front</p>
                          <img
                            src={documentUrls.front}
                            alt="ID Front"
                            className="w-full h-20 object-cover rounded border"
                            onError={() =>
                              console.error(
                                "Failed to load front:",
                                documentUrls.front,
                              )
                            }
                          />
                        </div>
                      )}
                      {documentUrls.back && (
                        <div>
                          <p className="text-xs text-default-600 mb-1">Back</p>
                          <img
                            src={documentUrls.back}
                            alt="ID Back"
                            className="w-full h-20 object-cover rounded border"
                            onError={() =>
                              console.error(
                                "Failed to load back:",
                                documentUrls.back,
                              )
                            }
                          />
                        </div>
                      )}
                      {documentUrls.selfie && (
                        <div>
                          <p className="text-xs text-default-600 mb-1">
                            Selfie
                          </p>
                          <img
                            src={documentUrls.selfie}
                            alt="Selfie"
                            className="w-full h-20 object-cover rounded border"
                            onError={() =>
                              console.error(
                                "Failed to load selfie:",
                                documentUrls.selfie,
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  variant="flat"
                  size="sm"
                  isLoading={checking}
                  onPress={checkKycStatus}
                  className="w-full"
                >
                  Check Status
                </Button>
              </CardBody>
            </Card>
          ) : (
            <p className="text-default-600 text-lg">
              Complete your identity verification in just 3 minutes. We'll guide
              you through capturing your ID and taking a selfie.
            </p>
          )}
        </div>

        {!verificationData && (
          <Button
            color="primary"
            size="lg"
            onPress={() => router.push("/onboarding/kyc/capture")}
            className="px-12"
          >
            Get Started
          </Button>
        )}
      </div>
    </div>
  );
}
