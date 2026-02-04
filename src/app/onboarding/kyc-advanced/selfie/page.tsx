"use client";

import { useState, useRef, useEffect } from "react";
import { Card, Button, Chip, Spinner } from "@heroui/react";
import { addToast } from "@heroui/toast";
import Webcam from "react-webcam";
import { useRouter } from "next/navigation";
import * as faceapi from "face-api.js";

export default function SelfiePage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [challenges, setChallenges] = useState({ blink: false, smile: false });
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadModels();
    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (modelsLoaded && !selfieImage) {
      startFaceDetection();
    }
  }, [modelsLoaded, selfieImage]);

  useEffect(() => {
    if (challenges.blink && challenges.smile && !selfieImage) {
      captureAndComplete();
    }
  }, [challenges, selfieImage]);

  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      setModelsLoaded(true);
    } catch (error) {
      console.error("Model load error:", error);
      addToast({ title: "Failed to load face detection", color: "danger" });
    }
  };

  const startFaceDetection = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    detectionIntervalRef.current = setInterval(async () => {
      await detectFace();
    }, 500);
  };

  const detectFace = async () => {
    if (!webcamRef.current?.video) return;
    const video = webcamRef.current.video;
    if (video.readyState !== 4) return;

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (detection) {
        setFaceDetected(true);
        const landmarks = detection.landmarks;

        if (!challenges.blink) {
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();
          const leftEAR = calculateEyeAspectRatio(leftEye);
          const rightEAR = calculateEyeAspectRatio(rightEye);
          const avgEAR = (leftEAR + rightEAR) / 2;
          
          // More lenient threshold for blink detection
          if (avgEAR < 0.25) {
            setChallenges(prev => ({ ...prev, blink: true }));
            addToast({ title: "Blink detected ✓", color: "success" });
          }
        }

        if (!challenges.smile) {
          const mouth = landmarks.getMouth();
          const mouthWidth = distance(mouth[0], mouth[6]);
          const mouthHeight = distance(mouth[3], mouth[9]);
          const mouthRatio = mouthWidth / mouthHeight;
          
          // More strict threshold for smile detection
          if (mouthRatio > 3.0) {
            setChallenges(prev => ({ ...prev, smile: true }));
            addToast({ title: "Smile detected ✓", color: "success" });
          }
        }
      } else {
        setFaceDetected(false);
      }
    } catch (error) {
      console.error("Detection error:", error);
    }
  };

  const calculateEyeAspectRatio = (eye: faceapi.Point[]): number => {
    const v1 = distance(eye[1], eye[5]);
    const v2 = distance(eye[2], eye[4]);
    const h = distance(eye[0], eye[3]);
    return (v1 + v2) / (2 * h);
  };

  const distance = (p1: faceapi.Point, p2: faceapi.Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const captureAndComplete = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setSelfieImage(imageSrc);
        sessionStorage.setItem("kyc_selfie_image", imageSrc);
        sessionStorage.setItem("kyc_liveness_passed", "true");
        addToast({ title: "Liveness verified", color: "success" });
        setTimeout(() => router.push("/onboarding/kyc-advanced/results"), 1000);
      }
    }
  };

  if (!modelsLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-sm text-default-500">Loading face detection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Take Selfie</h1>
          <p className="text-sm text-default-500">Complete the challenges</p>
        </div>

        <Card shadow="none" className="border mb-4">
          <div className="relative bg-gray-900 aspect-video">
            {!selfieImage ? (
              <>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user", width: 1280, height: 720 }}
                  className="w-full h-full object-cover"
                  mirrored
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`w-64 h-80 rounded-full border-4 transition-colors ${faceDetected ? 'border-success' : 'border-white'}`} />
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <Chip color={challenges.blink ? "success" : "default"} size="sm">
                    {challenges.blink ? "✓" : "○"} Blink
                  </Chip>
                  <Chip color={challenges.smile ? "success" : "default"} size="sm">
                    {challenges.smile ? "✓" : "○"} Smile
                  </Chip>
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Chip color={faceDetected ? "success" : "default"}>
                    {faceDetected ? "Face detected" : "Position your face"}
                  </Chip>
                </div>
              </>
            ) : (
              <img src={selfieImage} alt="Selfie" className="w-full h-full object-cover" />
            )}
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="bordered" onPress={() => router.back()} className="flex-1">Back</Button>
        </div>
      </div>
    </div>
  );
}
