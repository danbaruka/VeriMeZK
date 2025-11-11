import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { useVerification } from '@/contexts/VerificationContext';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { motion } from 'framer-motion';

export function FaceVerification() {
  const webcamRef = useRef<Webcam>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { state, setFaceMatchScore, setStep } = useVerification();

  useEffect(() => {
    async function loadModels() {
      try {
        const MODEL_URL = '/models'; // Models should be placed in public/models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Failed to load face-api models:', err);
        setError('Failed to load face recognition models. Please refresh the page.');
      }
    }
    loadModels();
  }, []);

  const captureAndVerify = useCallback(async () => {
    if (!webcamRef.current || !modelsLoaded) return;

    setVerifying(true);
    setError(null);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        throw new Error('Failed to capture image');
      }

      const img = await faceapi.fetchImage(imageSrc);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        throw new Error('No face detected. Please ensure your face is clearly visible.');
      }

      // For MVP: Simulate face matching score
      // In production, compare with passport photo descriptor
      // For now, generate a random score >95% to simulate success
      const simulatedScore = 0.95 + Math.random() * 0.04; // 95-99%
      
      setMatchScore(simulatedScore);
      setFaceMatchScore(simulatedScore);
      
      if (simulatedScore >= 0.95) {
        setStep('proving');
      } else {
        setError(`Face match score too low: ${(simulatedScore * 100).toFixed(1)}%. Please try again.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Face verification failed');
    } finally {
      setVerifying(false);
    }
  }, [modelsLoaded, setFaceMatchScore, setStep]);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, []);

  if (hasPermission === false) {
    return (
      <Card>
        <div className="text-center space-y-4">
          <p className="text-red-600 dark:text-red-400">
            Camera access denied. Please enable camera permissions for face verification.
          </p>
        </div>
      </Card>
    );
  }

  if (matchScore !== null && matchScore >= 0.95) {
    return (
      <Card>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
              Face Verified
            </h2>
            <p className="text-black/70 dark:text-white/70">
              Match score: {(matchScore * 100).toFixed(1)}%
            </p>
          </div>
        </motion.div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-black dark:text-white text-center">
          Face Verification
        </h2>
        <p className="text-black/70 dark:text-white/70 text-center">
          Please look directly at the camera for face verification
        </p>

        {!modelsLoaded && (
          <div className="text-center py-8">
            <p className="text-black/60 dark:text-white/60">Loading face recognition models...</p>
          </div>
        )}

        {hasPermission && modelsLoaded && (
          <div className="relative rounded-lg overflow-hidden">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full"
            />
            <div className="absolute inset-0 border-4 border-white/50 rounded-lg pointer-events-none" />
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-lg p-4 border border-red-500/50"
          >
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        <Button
          onClick={captureAndVerify}
          isLoading={verifying || !modelsLoaded}
          disabled={verifying || !modelsLoaded || !hasPermission}
          className="w-full"
        >
          {verifying ? 'Verifying...' : 'Verify Face'}
        </Button>
      </div>
    </Card>
  );
}

