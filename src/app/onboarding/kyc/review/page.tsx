"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Spinner,
  DatePicker,
  Switch,
} from "@heroui/react";
import { Alert,addToast} from "@heroui/react";
import { useRouter } from "next/navigation";
import { parseDate, type DateValue } from "@internationalized/date";
import {
  extractDocumentData,
  type ExtractedData,
} from "@/lib/ocr/document-extractor";

export default function ReviewDataPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null,
  );
  const [editedData, setEditedData] = useState<ExtractedData>({});
  const [noExpiry, setNoExpiry] = useState(false);

  useEffect(() => {
    const loadAndExtract = async () => {
      const front = sessionStorage.getItem("kyc_front_image");
      const back = sessionStorage.getItem("kyc_back_image");
      if (!front) {
        router.push("/onboarding/kyc/capture");
        return;
      }

      setFrontImage(front);
      if (back) setBackImage(back);

      try {
        const data = await extractDocumentData(front);
        setExtractedData(data);
        setEditedData(data);
        addToast({ title: "Data extracted", color: "success" });
      } catch (err) {
        console.error(err);
        addToast({
          title: "Extraction failed",
          description: "Please enter manually",
          color: "warning",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAndExtract();
  }, [router]);

  const handleContinue = () => {
    sessionStorage.setItem("kyc_extracted_data", JSON.stringify(editedData));
    router.push("/onboarding/kyc/selfie");
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Review Details</h1>
          <p className="text-sm text-default-500">
            Verify and correct if needed
          </p>
        </div>

        <Alert color="primary" variant="flat" className="mb-4 text-sm">
          OCR accuracy varies. Please review carefully.
        </Alert>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Card shadow="none" className="border">
              <CardBody className="p-4">
                <h3 className="text-sm font-medium mb-3">Front</h3>
                {frontImage && (
                  <img
                    src={frontImage}
                    alt="Document Front"
                    className="w-full rounded border"
                  />
                )}
                {extractedData?.confidence && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Confidence</span>
                      <span>{Math.round(extractedData.confidence)}%</span>
                    </div>
                    <div className="w-full bg-default-200 rounded-full h-1.5">
                      <div
                        className="bg-success h-1.5 rounded-full"
                        style={{ width: `${extractedData.confidence}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {backImage && (
              <Card shadow="none" className="border">
                <CardBody className="p-4">
                  <h3 className="text-sm font-medium mb-3">Back</h3>
                  <img
                    src={backImage}
                    alt="Document Back"
                    className="w-full rounded border"
                  />
                </CardBody>
              </Card>
            )}
          </div>

          <div className="space-y-3">
            <Input
              label="Document Number"
              value={editedData.documentNumber || ""}
              onChange={(e) =>
                setEditedData({ ...editedData, documentNumber: e.target.value })
              }
              size="sm"
            />
            <Input
              label="Surname"
              value={editedData.surname || ""}
              onChange={(e) =>
                setEditedData({ ...editedData, surname: e.target.value })
              }
              size="sm"
            />
            <Input
              label="Given Names"
              value={editedData.givenNames || ""}
              onChange={(e) =>
                setEditedData({ ...editedData, givenNames: e.target.value })
              }
              size="sm"
            />
            <DatePicker
              label="Date of Birth"
              showMonthAndYearPickers
              value={
                editedData.dateOfBirth
                  ? (parseDate(editedData.dateOfBirth) as any)
                  : null
              }
              onChange={(date) =>
                setEditedData({
                  ...editedData,
                  dateOfBirth: date?.toString() || "",
                })
              }
              size="sm"
            />
            <div className="space-y-2">
              <DatePicker
                label="Expiry Date"
                showMonthAndYearPickers
                isDisabled={noExpiry}
                value={
                  editedData.expiryDate && editedData.expiryDate !== "No Expiry"
                    ? (parseDate(editedData.expiryDate) as any)
                    : null
                }
                onChange={(date) =>
                  setEditedData({
                    ...editedData,
                    expiryDate: date?.toString() || "",
                  })
                }
                size="sm"
              />
              <Switch
                size="sm"
                isSelected={noExpiry}
                onValueChange={(checked) => {
                  setNoExpiry(checked);
                  if (checked) {
                    setEditedData({ ...editedData, expiryDate: "No Expiry" });
                  }
                }}
              >
                <span className="text-xs">No expiry date</span>
              </Switch>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Gender"
                placeholder="M/F"
                value={editedData.gender || ""}
                onChange={(e) =>
                  setEditedData({ ...editedData, gender: e.target.value })
                }
                size="sm"
              />
              <Input
                label="Nationality"
                value={editedData.nationality || ""}
                onChange={(e) =>
                  setEditedData({ ...editedData, nationality: e.target.value })
                }
                size="sm"
              />
            </div>
            <div className="flex flex-col gap-3 mt-6">
              <Button
                color="primary"
                onPress={handleContinue}
              // className="flex-1"
              >
                Continue
              </Button>
              <Button
                variant="flat"
                onPress={() => router.back()}
              // className="flex-1"
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
