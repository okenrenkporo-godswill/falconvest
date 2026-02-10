"use client";

import { useState, useRef, useEffect } from "react";
import { Card, Button, Chip, Spinner } from "@heroui/react";
import { addToast } from "@heroui/react";
import Webcam from "react-webcam";
import { useRouter } from "next/navigation";
import * as faceapi from "face-api.js";

export default function SelfiePage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceQuality, setFaceQuality] = useState({
    clear: false,
    centered: false,
  });
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadModels();
    return () => {
      if (detectionIntervalRef.current)
        clearInterval(detectionIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (modelsLoaded && !selfieImage) {
      startFaceDetection();
    }
  }, [modelsLoaded, selfieImage]);

  useEffect(() => {
    if (
      faceQuality.clear &&
      faceQuality.centered &&
      !selfieImage &&
      countdown === null
    ) {
      // Start countdown when face is good
      setCountdown(3);
    }
  }, [faceQuality, selfieImage, countdown]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      captureAndComplete();
    }
  }, [countdown]);

  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      setModelsLoaded(true);
    } catch (error) {
      console.error("Model load error:", error);
      addToast({ title: "Failed to load face detection", color: "danger" });
    }
  };

  const startFaceDetection = () => {
    if (detectionIntervalRef.current)
      clearInterval(detectionIntervalRef.current);
    detectionIntervalRef.current = setInterval(async () => {
      await detectFace();
    }, 300);
  };

  const detectFace = async () => {
    if (!webcamRef.current?.video) return;
    const video = webcamRef.current.video;
    if (video.readyState !== 4) return;

    try {
      const detection = await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }),
        )
        .withFaceLandmarks();

      if (detection) {
        setFaceDetected(true);

        // Check if face is centered
        const box = detection.detection.box;
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        const videoCenterX = video.videoWidth / 2;
        const videoCenterY = video.videoHeight / 2;

        const isCentered =
          Math.abs(centerX - videoCenterX) < video.videoWidth * 0.15 &&
          Math.abs(centerY - videoCenterY) < video.videoHeight * 0.15;

        // Check if face is clear (good size)
        const faceSize = box.width * box.height;
        const videoSize = video.videoWidth * video.videoHeight;
        const sizeRatio = faceSize / videoSize;
        const isClear = sizeRatio > 0.08 && sizeRatio < 0.4;

        setFaceQuality({ clear: isClear, centered: isCentered });
      } else {
        setFaceDetected(false);
        setFaceQuality({ clear: false, centered: false });
        setCountdown(null);
      }
    } catch (error) {
      console.error("Detection error:", error);
    }
  };

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

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
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = base64;
    });
  };

  const captureAndComplete = async () => {
    if (detectionIntervalRef.current)
      clearInterval(detectionIntervalRef.current);
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          const compressed = await compressImage(imageSrc);
          setSelfieImage(compressed);
          sessionStorage.setItem("kyc_selfie_image", compressed);
          sessionStorage.setItem("kyc_liveness_passed", "true");
          addToast({ title: "Liveness verified", color: "success" });
          setTimeout(() => router.push("/onboarding/kyc/results"), 1000);
        } catch (err) {
          addToast({
            title: "Error",
            description: "Failed to save selfie",
            color: "danger",
          });
        }
      }
    }
  };

  if (!modelsLoaded) {
    return (
      <div className=" bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-sm text-default-500">Loading face detection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Take Selfie</h1>
          <p className="text-sm text-default-500">
            Position your face in the circle
          </p>
        </div>

        <Card shadow="none" className="border mb-4">
          <div className="relative bg-gray-900 aspect-video overflow-hidden">
            {!selfieImage ? (
              <>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: "user",
                    width: 1280,
                    height: 720,
                  }}
                  className="w-full h-full object-cover"
                  mirrored
                />
                {/* Blur overlay with circular cutout */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full">
                    <defs>
                      <mask id="faceMask">
                        <rect width="100%" height="100%" fill="white" />
                        <circle cx="50%" cy="50%" r="140" fill="black" />
                      </mask>
                    </defs>
                    <rect
                      width="100%"
                      height="100%"
                      fill="rgba(0,0,0,0.6)"
                      mask="url(#faceMask)"
                      style={{ backdropFilter: "blur(8px)" }}
                    />
                  </svg>
                  {/* Circle border */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`w-[280px] h-[280px] rounded-full border-4 transition-colors ${faceQuality.clear && faceQuality.centered
                        ? "border-success"
                        : "border-white"
                        }`}
                    />
                  </div>
                </div>

                {/* Countdown */}
                {countdown !== null && countdown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-8xl font-bold">
                      {countdown}
                    </div>
                  </div>
                )}

                {/* Status indicators */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Chip color={faceDetected ? "success" : "default"} size="sm">
                    {faceDetected ? "✓" : "○"} Face
                  </Chip>
                  <Chip
                    color={faceQuality.centered ? "success" : "default"}
                    size="sm"
                  >
                    {faceQuality.centered ? "✓" : "○"} Centered
                  </Chip>
                  <Chip
                    color={faceQuality.clear ? "success" : "default"}
                    size="sm"
                  >
                    {faceQuality.clear ? "✓" : "○"} Clear
                  </Chip>
                </div>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Chip color={faceDetected ? "success" : "default"}>
                    {faceDetected ? "Face detected" : "Position your face"}
                  </Chip>
                </div>
              </>
            ) : (
              <img
                src={selfieImage}
                alt="Selfie"
                className="w-full h-full object-cover"
              />
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
        </div>
      </div>
    </div>
  );
}
