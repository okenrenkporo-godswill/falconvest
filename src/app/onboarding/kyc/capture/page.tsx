"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, Button, Chip } from "@heroui/react";
import { addToast } from "@heroui/toast";
import Webcam from "react-webcam";
import { useRouter } from "next/navigation";

export default function DocumentCapturePage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [side, setSide] = useState<"front" | "back">("front");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [documentDetected, setDocumentDetected] = useState(false);
  const [documentType, setDocumentType] = useState<"passport" | "id" | null>(
    null,
  );
  const [captureMode, setCaptureMode] = useState<"camera" | "upload">("camera");
  const [detectionCount, setDetectionCount] = useState(0);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentImage = side === "front" ? frontImage : backImage;

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        if (side === "front") {
          setFrontImage(imageSrc);
          detectDocumentType(imageSrc);
          addToast({ title: "Front captured", color: "success" });
          // Auto-switch to back for documents that need it
          if (documentType !== "passport") {
            setTimeout(() => setSide("back"), 500);
          }
        } else {
          setBackImage(imageSrc);
          addToast({ title: "Back captured", color: "success" });
        }
        setDocumentDetected(false);
        setDetectionCount(0);
      }
    }
  }, [side]);

  const autoCapture = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    setTimeout(() => {
      capture();
      setDetectionCount(0);
    }, 100);
  }, [capture]);

  useEffect(() => {
    if (captureMode === "camera" && !currentImage) {
      startDocumentDetection();
    }
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [captureMode, side, frontImage, backImage, currentImage]);

  useEffect(() => {
    if (detectionCount >= 3 && !currentImage) {
      autoCapture();
    }
  }, [detectionCount, currentImage, autoCapture]);

  const startDocumentDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    setDetectionCount(0);
    detectionIntervalRef.current = setInterval(() => {
      detectDocument();
    }, 500);
  };

  const detectDocument = async () => {
    if (!webcamRef.current?.video) return;
    const video = webcamRef.current.video;
    if (video.readyState !== 4) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasDocument = checkForDocument(imageData);

    if (hasDocument) {
      setDocumentDetected(true);
      setDetectionCount((prev) => prev + 1);
    } else {
      setDocumentDetected(false);
      setDetectionCount(0);
    }
  };

  const checkForDocument = (imageData: ImageData): boolean => {
    const centerX = imageData.width / 2;
    const centerY = imageData.height / 2;
    const sampleSize = 100;
    let edgeCount = 0;

    for (let i = 0; i < sampleSize; i++) {
      const x = Math.floor(
        centerX + (Math.random() - 0.5) * imageData.width * 0.6,
      );
      const y = Math.floor(
        centerY + (Math.random() - 0.5) * imageData.height * 0.4,
      );
      const idx = (y * imageData.width + x) * 4;
      const brightness =
        (imageData.data[idx] +
          imageData.data[idx + 1] +
          imageData.data[idx + 2]) /
        3;
      if (brightness > 200 || brightness < 50) edgeCount++;
    }
    return edgeCount > sampleSize * 0.3;
  };

  const detectDocumentType = (imageData: string) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      if (aspectRatio > 1.3 && aspectRatio < 1.5) {
        setDocumentType("passport");
        addToast({
          title: "Passport detected",
          description: "Back not required",
          color: "primary",
        });
      } else {
        setDocumentType("id");
      }
    };
    img.src = imageData;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageSrc = e.target?.result as string;
      if (side === "front") {
        setFrontImage(imageSrc);
        detectDocumentType(imageSrc);
        addToast({ title: "Front uploaded", color: "success" });
      } else {
        setBackImage(imageSrc);
        addToast({ title: "Back uploaded", color: "success" });
      }
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (
    base64: string,
    maxSizeKB: number = 500,
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Scale down if too large
        const maxDimension = 1200;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        // Try different quality levels
        let quality = 0.7;
        let compressed = canvas.toDataURL("image/jpeg", quality);

        // Reduce quality if still too large
        while (compressed.length > maxSizeKB * 1024 && quality > 0.1) {
          quality -= 0.1;
          compressed = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(compressed);
      };
      img.src = base64;
    });
  };

  const handleContinue = async () => {
    if (!frontImage) return;

    try {
      // setError("");
      addToast({ title: "Compressing images...", color: "default" });

      const compressedFront = await compressImage(frontImage);
      sessionStorage.setItem("kyc_front_image", compressedFront);
      sessionStorage.setItem("kyc_document_type", documentType || "id");

      if (backImage) {
        const compressedBack = await compressImage(backImage);
        sessionStorage.setItem("kyc_back_image", compressedBack);
      }

      router.push("/onboarding/kyc/review");
    } catch (err) {
      // setError("Failed to save images. Please try again.");
      addToast({
        title: "Error",
        description: "Failed to save images. Please try retaking photos.",
        color: "danger",
      });
    }
  };

  const retake = () => {
    if (side === "front") {
      setFrontImage(null);
      setDocumentType(null);
    } else {
      setBackImage(null);
    }
    setDocumentDetected(false);
    setDetectionCount(0);
    startDocumentDetection();
  };

  return (
    <div className="min-h-full bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Capture Document</h1>
          <p className="text-sm text-default-500">Position within frame</p>
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            color={captureMode === "camera" ? "primary" : "default"}
            variant={captureMode === "camera" ? "solid" : "bordered"}
            size="sm"
            onPress={() => setCaptureMode("camera")}
          >
            Camera
          </Button>
          <Button
            color={captureMode === "upload" ? "primary" : "default"}
            variant={captureMode === "upload" ? "solid" : "bordered"}
            size="sm"
            onPress={() => {
              setCaptureMode("upload");
              fileInputRef.current?.click();
            }}
          >
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            color={side === "front" ? "primary" : "default"}
            variant={side === "front" ? "solid" : "flat"}
            size="sm"
            onPress={() => setSide("front")}
            isDisabled={!frontImage && side === "back"}
            className="flex-1"
          >
            Front {frontImage && "✓"}
            {documentType === "passport" && (
              <Chip size="sm" className="ml-2">
                Passport
              </Chip>
            )}
          </Button>
          <Button
            color={side === "back" ? "primary" : "default"}
            variant={side === "back" ? "solid" : "flat"}
            size="sm"
            onPress={() => setSide("back")}
            isDisabled={!frontImage || documentType === "passport"}
            className="flex-1"
          >
            Back {backImage && "✓"}
          </Button>
        </div>

        <Card shadow="none" className="border mb-4">
          <div className="relative bg-gray-900 aspect-video">
            {!currentImage && captureMode === "camera" ? (
              <>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: "environment",
                    width: 1920,
                    height: 1080,
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-[80%] h-[60%]">
                    <div
                      className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg transition-colors ${documentDetected ? "border-success" : "border-white"}`}
                    />
                    <div
                      className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg transition-colors ${documentDetected ? "border-success" : "border-white"}`}
                    />
                    <div
                      className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg transition-colors ${documentDetected ? "border-success" : "border-white"}`}
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-lg transition-colors ${documentDetected ? "border-success" : "border-white"}`}
                    />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div
                        className={`px-3 py-1 rounded text-xs font-medium ${documentDetected ? "bg-success text-white" : "bg-black/50 text-white"}`}
                      >
                        {documentDetected
                          ? "✓ Detected"
                          : side === "front"
                            ? "Front"
                            : "Back"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <Chip
                    color={documentDetected ? "success" : "default"}
                    size="sm"
                  >
                    {documentDetected ? "Hold still" : "Position document"}
                  </Chip>
                </div>
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                  <Button
                    color="primary"
                    size="lg"
                    onPress={capture}
                    className="rounded-full w-14 h-14"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>
                </div>
              </>
            ) : currentImage ? (
              <>
                <img
                  src={currentImage}
                  alt={`${side} of document`}
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <Button size="sm" variant="flat" onPress={retake}>
                    Retake
                  </Button>
                  {side === "front" &&
                    !backImage &&
                    documentType !== "passport" && (
                      <Button
                        size="sm"
                        color="primary"
                        onPress={() => setSide("back")}
                      >
                        Capture Back
                      </Button>
                    )}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Button
                  color="primary"
                  onPress={() => fileInputRef.current?.click()}
                >
                  Upload {side === "front" ? "Front" : "Back"}
                </Button>
              </div>
            )}
          </div>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="bordered"
            onPress={() => router.back()}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            color="primary"
            onPress={handleContinue}
            isDisabled={!frontImage}
            className="flex-1"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
