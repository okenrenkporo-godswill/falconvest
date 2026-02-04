"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Button, Spinner, Chip } from "@heroui/react";
import { useRouter } from "next/navigation";
import * as faceapi from "face-api.js";

interface VerificationResult {
  faceMatch: { score: number; passed: boolean };
  liveness: { passed: boolean };
  overall: { status: "passed" | "failed" | "manual_review"; confidence: number };
}

export default function ResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    performVerification();
  }, []);

  const performVerification = async () => {
    try {
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');

      const frontImage = sessionStorage.getItem("kyc_front_image");
      const backImage = sessionStorage.getItem("kyc_back_image");
      const selfieImage = sessionStorage.getItem("kyc_selfie_image");
      const extractedDataStr = sessionStorage.getItem("kyc_extracted_data");
      const livenessPassed = sessionStorage.getItem("kyc_liveness_passed") === "true";

      if (!frontImage || !selfieImage || !extractedDataStr) {
        router.push("/onboarding/kyc-advanced/capture");
        return;
      }

      const extractedData = JSON.parse(extractedDataStr);

      const docImg = await faceapi.fetchImage(frontImage);
      const selfieImg = await faceapi.fetchImage(selfieImage);

      const docDetection = await faceapi
        .detectSingleFace(docImg, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      const selfieDetection = await faceapi
        .detectSingleFace(selfieImg, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!docDetection || !selfieDetection) {
        setResult({
          faceMatch: { score: 0, passed: false },
          liveness: { passed: livenessPassed },
          overall: { status: "failed", confidence: 0 },
        });
        setLoading(false);
        return;
      }

      const distance = faceapi.euclideanDistance(docDetection.descriptor, selfieDetection.descriptor);
      const similarity = Math.max(0, (1 - distance / 0.6) * 100);
      const faceMatchPassed = similarity >= 70;

      const overallPassed = faceMatchPassed && livenessPassed;
      const confidence = (similarity + (livenessPassed ? 100 : 0)) / 2;

      const verificationResult: VerificationResult = {
        faceMatch: { score: similarity, passed: faceMatchPassed },
        liveness: { passed: livenessPassed },
        overall: {
          status: (overallPassed ? "passed" : confidence > 50 ? "manual_review" : "failed") as "passed" | "failed" | "manual_review",
          confidence,
        },
      };

      setResult(verificationResult);

      // Submit to backend
      const { submitAdvancedKycAction } = await import("@/actions/kyc");
      const response = await submitAdvancedKycAction({
        frontImage,
        backImage: backImage || undefined,
        selfieImage,
        extractedData,
        verificationResult,
      });

      if (response.error) {
        console.error("Submission error:", response.error);
      } else {
        // Clear session storage
        sessionStorage.removeItem("kyc_front_image");
        sessionStorage.removeItem("kyc_back_image");
        sessionStorage.removeItem("kyc_selfie_image");
        sessionStorage.removeItem("kyc_extracted_data");
        sessionStorage.removeItem("kyc_liveness_passed");
        sessionStorage.removeItem("kyc_document_type");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setResult({
        faceMatch: { score: 0, passed: false },
        liveness: { passed: false },
        overall: { status: "failed", confidence: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-sm text-default-500">Verifying...</p>
        </div>
      </div>
    );
  }

  const statusColor = result?.overall.status === "passed" ? "success" : result?.overall.status === "manual_review" ? "warning" : "danger";

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Verification Complete</h1>
          <Chip color={statusColor} size="lg">
            {result?.overall.status === "passed" ? "✓ Verified" : result?.overall.status === "manual_review" ? "Under Review" : "Failed"}
          </Chip>
        </div>

        <Card shadow="none" className="border mb-4">
          <CardBody className="p-5">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Face Match</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{Math.round(result?.faceMatch.score || 0)}%</span>
                  <Chip color={result?.faceMatch.passed ? "success" : "danger"} size="sm">
                    {result?.faceMatch.passed ? "✓" : "✗"}
                  </Chip>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Liveness</span>
                <Chip color={result?.liveness.passed ? "success" : "danger"} size="sm">
                  {result?.liveness.passed ? "✓" : "✗"}
                </Chip>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-sm font-medium">Overall</span>
                <span className="text-sm font-medium">{Math.round(result?.overall.confidence || 0)}%</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {result?.overall.status === "passed" && (
          <Card shadow="none" className="border border-success mb-4">
            <CardBody className="p-4 text-sm text-success">
              Your identity has been verified successfully.
            </CardBody>
          </Card>
        )}

        {result?.overall.status === "manual_review" && (
          <Card shadow="none" className="border border-warning mb-4">
            <CardBody className="p-4 text-sm text-warning">
              Your submission will be reviewed manually within 24 hours.
            </CardBody>
          </Card>
        )}

        {result?.overall.status === "failed" && (
          <Card shadow="none" className="border border-danger mb-4">
            <CardBody className="p-4 text-sm text-danger">
              Verification failed. Please try again with better lighting.
            </CardBody>
          </Card>
        )}

        <div className="flex gap-3">
          {result?.overall.status === "failed" && (
            <Button color="primary" onPress={() => router.push("/onboarding/kyc-advanced/capture")} className="flex-1">
              Try Again
            </Button>
          )}
          <Button
            variant={result?.overall.status === "failed" ? "bordered" : "solid"}
            color={result?.overall.status === "failed" ? "default" : "primary"}
            onPress={() => router.push("/dashboard")}
            className="flex-1"
          >
            {result?.overall.status === "passed" ? "Continue" : "Go to Dashboard"}
          </Button>
        </div>
      </div>
    </div>
  );
}
