"use client";

import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Alert } from "@heroui/alert";
import { addToast } from "@heroui/toast";
import { useState } from "react";
import { uploadKycAction } from "@/actions/kyc";
import { useRouter } from "next/navigation";

export default function KycOnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!frontFile) {
      setError("Please upload the front of your ID");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("frontFile", frontFile);
    if (backFile) {
      formData.append("backFile", backFile);
    }

    try {
      const result = await uploadKycAction(formData);

      if (result?.error) {
        setError(result.error);
        addToast({
          title: "Error",
          description: result.error,
          color: "danger",
        });
        setLoading(false);
      } else {
        addToast({
          title: "Success",
          description: "KYC documents uploaded successfully. We'll review them within 24 hours.",
          color: "success",
        });
        router.push("/dashboard");
      }
    } catch (error) {
      setError("An error occurred while uploading");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-default-100">
      <Card className="w-full max-w-2xl p-7">
        <CardHeader className="flex flex-col gap-2 items-start pb-6">
          <h1 className="text-3xl font-bold">Complete Your KYC Verification</h1>
          <p className="text-sm text-default-600">
            To start trading, please upload a government-issued ID
          </p>
        </CardHeader>
        <CardBody className="gap-6">
          <Alert color="primary" variant="faded" title="Why do we need this?">
            <p className="text-sm">
              KYC (Know Your Customer) verification is required by law to prevent fraud and money laundering. 
              Your information is encrypted and stored securely.
            </p>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Accepted Documents:</h3>
              <ul className="list-disc list-inside text-sm text-default-600 space-y-1">
                <li>Passport</li>
                <li>Driver's License</li>
                <li>National ID Card</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Requirements:</h3>
              <ul className="list-disc list-inside text-sm text-default-600 space-y-1">
                <li>Document must be valid (not expired)</li>
                <li>All text must be clearly visible</li>
                <li>Photo must be in color</li>
                <li>File format: JPG, PNG, or PDF</li>
                <li>Maximum file size: 5MB per file</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Front of ID <span className="text-danger">*</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => setFrontFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-default-600
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-primary-foreground
                    hover:file:bg-primary/90
                    cursor-pointer"
                  required
                />
                {frontFile && (
                  <p className="text-xs text-success mt-1">
                    ✓ {frontFile.name} ({(frontFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Back of ID (if applicable)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => setBackFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-default-600
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-default-200 file:text-default-700
                    hover:file:bg-default-300
                    cursor-pointer"
                />
                {backFile && (
                  <p className="text-xs text-success mt-1">
                    ✓ {backFile.name} ({(backFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>

            {error && (
              <Alert color="danger" title="Error">
                {error}
              </Alert>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                color="primary"
                className="flex-1"
                isLoading={loading}
                isDisabled={!frontFile}
              >
                Upload & Continue
              </Button>
              <Button
                type="button"
                variant="bordered"
                onPress={() => router.push("/dashboard")}
                isDisabled={loading}
              >
                Skip for Now
              </Button>
            </div>

            <p className="text-xs text-default-500 text-center">
              By uploading your documents, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
