import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Button } from '@/components/shared/Button';
import { PhonePairing } from '@/components/scan/PhonePairing';

interface FaceCaptureStepProps {
  onCaptured: (imageData: string) => void;
  onRetry: () => void;
  error: string | null;
}

export function FaceCaptureStep({ onCaptured, onRetry, error }: FaceCaptureStepProps) {
  const webcamRef = useRef<Webcam>(null);
  const [usePhone, setUsePhone] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (usePhone) return;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, [usePhone]);

  const captureFace = useCallback(() => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturing(true);
      setTimeout(() => {
        onCaptured(imageSrc);
        setCapturing(false);
      }, 500);
    }
  }, [onCaptured]);

  const handleFaceFromPhone = useCallback((faceImageData: string) => {
    onCaptured(faceImageData);
    setUsePhone(false);
  }, [onCaptured]);

  if (usePhone) {
    return (
      <PhonePairing
        onDocumentCaptured={() => {}}
        onFaceCaptured={handleFaceFromPhone}
        onCancel={() => setUsePhone(false)}
      />
    );
  }

  if (hasPermission === false) {
    return (
      <div className="text-center space-y-3 py-6">
        <p className="text-sm text-red-600 dark:text-red-400">
          Camera access denied. Please enable camera permissions.
        </p>
        <Button onClick={() => setHasPermission(null)} variant="secondary" className="text-sm">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="text-center space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
          Capture Your Face
        </h2>
        <p className="text-sm text-black/70 dark:text-white/70">
          Look directly at the camera and ensure good lighting
        </p>
      </div>

      {hasPermission && (
        <div className="relative rounded-lg overflow-hidden bg-black">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full"
            videoConstraints={{
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }}
          />
          
          {/* Face overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-4 border-white/80 rounded-full shadow-2xl" />
          </div>

          {/* Corner guides */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white/80 rounded-tl-full" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white/80 rounded-tr-full" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white/80 rounded-bl-full" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white/80 rounded-br-full" />
          </div>

          {capturing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-black rounded-xl p-4 sm:p-5 text-center space-y-3"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-black dark:border-white border-t-transparent rounded-full mx-auto"
                />
                <p className="text-sm sm:text-base text-black dark:text-white font-semibold">Capturing...</p>
              </motion.div>
            </div>
          )}
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-lg p-3 border border-red-500/50"
        >
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
        </motion.div>
      )}

      <div className="flex gap-2 sm:gap-3 pt-2">
        <Button
          onClick={() => setUsePhone(true)}
          variant="secondary"
          className="flex-1 text-sm"
          disabled={capturing}
        >
          Use Phone Camera
        </Button>
        <Button
          onClick={captureFace}
          isLoading={capturing}
          disabled={capturing || !hasPermission}
          className="flex-1 text-sm"
        >
          {capturing ? 'Capturing...' : 'Capture Face'}
        </Button>
      </div>
    </div>
  );
}

