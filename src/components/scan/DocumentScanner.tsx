import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsQR';
import { useVerification } from '@/contexts/VerificationContext';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import type { MRZData } from '@/types';
import { motion } from 'framer-motion';

function parseMRZ(mrzText: string): MRZData | null {
  // MRZ format: 2 lines for TD1 (ID card) or 3 lines for TD3 (passport)
  const lines = mrzText.split('\n').filter((line) => line.trim().length > 0);
  
  if (lines.length < 2) return null;

  try {
    // Parse TD3 format (passport) - 3 lines
    if (lines.length >= 3) {
      const line1 = lines[0]; // Document type, issuing country, name
      const line2 = lines[1]; // Passport number, check digit, nationality, DOB, gender, expiry
      const line3 = lines[2]; // Personal number, check digits

      const documentType = line1.substring(0, 1);
      const countryCode = line1.substring(2, 5);
      const name = line1.substring(5).replace(/</g, ' ').trim();
      const passportNumber = line2.substring(0, 9).replace(/</g, '');
      const nationality = line2.substring(10, 13);
      const dob = line2.substring(13, 19);
      const gender = line2.substring(20, 21);
      const expiryDate = line2.substring(21, 27);
      const personalNumber = line3.substring(0, 14).replace(/</g, '');

      // Parse DOB: YYMMDD -> Date
      const year = parseInt('20' + dob.substring(0, 2));
      const month = parseInt(dob.substring(2, 4)) - 1;
      const day = parseInt(dob.substring(4, 6));

      // Parse expiry: YYMMDD -> Date
      const expYear = parseInt('20' + expiryDate.substring(0, 2));
      const expMonth = parseInt(expiryDate.substring(2, 4)) - 1;
      const expDay = parseInt(expiryDate.substring(4, 6));

      return {
        documentType,
        countryCode,
        name,
        passportNumber,
        nationality,
        dob: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        gender,
        expiryDate: `${expYear}-${String(expMonth + 1).padStart(2, '0')}-${String(expDay).padStart(2, '0')}`,
        personalNumber: personalNumber || undefined,
      };
    }
  } catch (error) {
    console.error('MRZ parsing error:', error);
    return null;
  }

  return null;
}

export function DocumentScanner() {
  const webcamRef = useRef<Webcam>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<MRZData | null>(null);
  const { setMRZData, setStep } = useVerification();

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setScanning(true);
    setError(null);

    // Create image element to decode QR/MRZ
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Failed to initialize canvas');
        setScanning(false);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Try to decode QR code (MRZ might be encoded as QR)
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        const mrzData = parseMRZ(code.data);
        if (mrzData) {
          setScannedData(mrzData);
          setMRZData(mrzData);
          setStep('verifying');
        } else {
          setError('Could not parse MRZ data. Please ensure the document is clearly visible.');
        }
      } else {
        setError('Could not detect MRZ. Please ensure good lighting and try again.');
      }
      setScanning(false);
    };
    img.src = imageSrc;
  }, [setMRZData, setStep]);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  React.useEffect(() => {
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
            Camera access denied. Please enable camera permissions to scan your document.
          </p>
        </div>
      </Card>
    );
  }

  if (scannedData) {
    return (
      <Card>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-black dark:text-white">Document Scanned</h2>
          <div className="glass-strong rounded-lg p-4 space-y-2">
            <p className="text-sm text-black/60 dark:text-white/60">Name</p>
            <p className="text-lg font-semibold text-black dark:text-white">{scannedData.name}</p>
            <p className="text-sm text-black/60 dark:text-white/60">Passport Number</p>
            <p className="text-sm font-mono text-black dark:text-white">{scannedData.passportNumber}</p>
            <p className="text-sm text-black/60 dark:text-white/60">Nationality</p>
            <p className="text-sm text-black dark:text-white">{scannedData.nationality}</p>
            <p className="text-sm text-black/60 dark:text-white/60">Date of Birth</p>
            <p className="text-sm text-black dark:text-white">{scannedData.dob}</p>
            <p className="text-sm text-black/60 dark:text-white/60">Expiry Date</p>
            <p className="text-sm text-black dark:text-white">{scannedData.expiryDate}</p>
          </div>
        </motion.div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-black dark:text-white text-center">
          Scan Your Document
        </h2>
        <p className="text-black/70 dark:text-white/70 text-center">
          Position your passport or ID card so the MRZ (Machine Readable Zone) is clearly visible
        </p>

        {hasPermission && (
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
          onClick={capture}
          isLoading={scanning}
          disabled={scanning || !hasPermission}
          className="w-full"
        >
          {scanning ? 'Scanning...' : 'Capture & Scan'}
        </Button>
      </div>
    </Card>
  );
}

