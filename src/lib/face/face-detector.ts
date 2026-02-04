import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export async function loadFaceApiModels() {
  if (modelsLoaded) return;

  const MODEL_URL = '/models';
  
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    
    modelsLoaded = true;
    console.log("✅ Face-api.js models loaded");
  } catch (error) {
    console.error("❌ Failed to load face-api.js models:", error);
    throw new Error("Failed to load face detection models");
  }
}

export async function detectFace(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) {
  if (!modelsLoaded) {
    await loadFaceApiModels();
  }

  const detection = await faceapi
    .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection;
}

export async function detectFaces(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) {
  if (!modelsLoaded) {
    await loadFaceApiModels();
  }

  const detections = await faceapi
    .detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptors();

  return detections;
}

export function calculateEyeAspectRatio(eyePoints: faceapi.Point[]): number {
  // Calculate Eye Aspect Ratio (EAR) for blink detection
  const vertical1 = distance(eyePoints[1], eyePoints[5]);
  const vertical2 = distance(eyePoints[2], eyePoints[4]);
  const horizontal = distance(eyePoints[0], eyePoints[3]);
  
  return (vertical1 + vertical2) / (2.0 * horizontal);
}

export function detectBlink(landmarks: faceapi.FaceLandmarks68): boolean {
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  
  const leftEAR = calculateEyeAspectRatio(leftEye);
  const rightEAR = calculateEyeAspectRatio(rightEye);
  
  const avgEAR = (leftEAR + rightEAR) / 2;
  
  // EAR < 0.2 indicates closed eyes
  return avgEAR < 0.2;
}

export function detectSmile(landmarks: faceapi.FaceLandmarks68): boolean {
  const mouth = landmarks.getMouth();
  
  // Calculate mouth width and height
  const mouthWidth = distance(mouth[0], mouth[6]);
  const mouthHeight = distance(mouth[3], mouth[9]);
  
  // Smile ratio > 2.5 indicates a smile
  return mouthWidth / mouthHeight > 2.5;
}

export function detectHeadRotation(landmarks: faceapi.FaceLandmarks68): {
  angle: number;
  direction: 'left' | 'right' | 'center';
} {
  const nose = landmarks.getNose();
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  
  // Calculate center points
  const noseCenter = nose[3]; // Nose tip
  const leftEyeCenter = centerPoint(leftEye);
  const rightEyeCenter = centerPoint(rightEye);
  
  // Calculate angle between eyes and nose
  const eyeCenter = {
    x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
    y: (leftEyeCenter.y + rightEyeCenter.y) / 2,
  };
  
  const angle = Math.atan2(
    noseCenter.y - eyeCenter.y,
    noseCenter.x - eyeCenter.x
  ) * (180 / Math.PI);
  
  let direction: 'left' | 'right' | 'center' = 'center';
  if (angle < -15) direction = 'left';
  else if (angle > 15) direction = 'right';
  
  return { angle, direction };
}

export function compareFaces(
  descriptor1: Float32Array,
  descriptor2: Float32Array
): { distance: number; similarity: number; isMatch: boolean } {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  
  // Convert distance to similarity percentage (0-100)
  // Distance of 0 = 100% similar, distance of 0.6 = 0% similar
  const similarity = Math.max(0, Math.min(100, (1 - distance / 0.6) * 100));
  
  // Match threshold: 70% similarity
  const isMatch = similarity >= 70;
  
  return { distance, similarity, isMatch };
}

function distance(point1: faceapi.Point, point2: faceapi.Point): number {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
}

function centerPoint(points: faceapi.Point[]): { x: number; y: number } {
  const sum = points.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 }
  );
  
  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
  };
}
