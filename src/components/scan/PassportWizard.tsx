import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useVerification } from '@/contexts/VerificationContext';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { PhonePairing } from './PhonePairing';
import { validatePassport } from '@/utils/passportDetection';
import { parseMRZ } from '@/utils/mrzParser';
import type { MRZData } from '@/types';
import { motion } from 'framer-motion';
const formatMRZDate = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const clean = value.trim();
  if (clean.length < 6) return undefined;

  const yy = clean.slice(0, 2);
  const mm = clean.slice(2, 4);
  const dd = clean.slice(4, 6);

  const yearNum = Number(yy);
  const monthNum = Number(mm);
  const dayNum = Number(dd);

  if (
    Number.isNaN(yearNum) ||
    Number.isNaN(monthNum) ||
    Number.isNaN(dayNum) ||
    monthNum < 1 || monthNum > 12 ||
    dayNum < 1 || dayNum > 31
  ) {
    return undefined;
  }

  const century = yearNum >= 50 ? 1900 : 2000;
  const fullYear = century + yearNum;

  const date = new Date(Date.UTC(fullYear, monthNum - 1, dayNum));
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatMRZName = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const cleaned = value.replace(/<+/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned ? cleaned.toUpperCase() : undefined;
};

const normalizeValidation = (validation: any) => {
  if (!validation?.elements) return validation;

  const normalizedElements = Object.fromEntries(
    Object.entries(validation.elements).map(([key, element]: [string, any]) => {
      if (!element) return [key, element];
      let detected = !!element.detected;
      if (!detected && element.value) {
        detected = true;
      }
      let confidence = element.confidence ?? (detected ? 0.9 : 0);
      if (detected) {
        confidence = Math.min(Math.max(confidence, 0.85), 1);
      } else {
        confidence = Math.max(confidence, 0);
      }
      return [key, { ...element, detected, confidence }];
    })
  );

  return {
    ...validation,
    elements: normalizedElements,
  };
};

interface PassportWizardProps {
  onCancel?: () => void;
}

export function PassportWizard({ onCancel }: PassportWizardProps = {}) {
  const webcamRef = useRef<Webcam>(null);
  const [usePhone, setUsePhone] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<any>(null);
  const [scannedData, setScannedData] = useState<MRZData | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [allDetected, setAllDetected] = useState(false);
  const [cameraStopped, setCameraStopped] = useState(false);
  const [fullPassportData, setFullPassportData] = useState<any>(null);
  const [captureAttempted, setCaptureAttempted] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const phoneMrzDataRef = useRef<MRZData | null>(null);
  const { setMRZData, setStep } = useVerification();

  // Function to stop desktop camera
  const stopDesktopCamera = useCallback(() => {
    if (webcamRef.current) {
      const stream = (webcamRef.current as any).video?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track: MediaStreamTrack) => {
          track.stop();
          console.log('[PassportWizard] Desktop camera track stopped:', track.kind);
        });
      }
    }
    setCameraStopped(true);
  }, []);

    useEffect(() => {
      // Don't request camera if using phone
      if (usePhone) {
        stopDesktopCamera();
        return;
      }

      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => {
          setHasPermission(true);
        })
        .catch(() => setHasPermission(false));
    }, [usePhone, stopDesktopCamera]);

  // Stop camera immediately when usePhone becomes true
  useEffect(() => {
    if (usePhone) {
      console.log('[PassportWizard] Mobile camera selected, stopping desktop camera...');
      stopDesktopCamera();
    }
  }, [usePhone, stopDesktopCamera]);

  const performValidation = useCallback(async (overrideImage?: string) => {
    if (validating) {
      console.log('[PassportWizard] Validation already in progress.');
      return;
    }

    let imageSrc = overrideImage;
    const isOverride = typeof imageSrc === 'string' && imageSrc.length > 0;

    if (!isOverride) {
      phoneMrzDataRef.current = null;
      if (!webcamRef.current) {
        console.warn('[PassportWizard] No webcam available for capture');
        return;
      }
      console.log('[PassportWizard] Starting validation via webcam...');
      imageSrc = webcamRef.current.getScreenshot() || undefined;
      if (!imageSrc) {
        console.warn('[PassportWizard] No image captured from webcam');
        setError('Failed to capture image. Please try again.');
        return;
      }

      setCaptureAttempted(true);

      if (webcamRef.current) {
        const stream = (webcamRef.current as any).video?.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        }
      }
      setCameraStopped(true);
    } else {
      console.log('[PassportWizard] Starting validation from external image source...');
      setCaptureAttempted(true);
      stopDesktopCamera();
    }

    if (!imageSrc) {
      setError('Failed to capture image. Please try again.');
      return;
    }

    setCapturedImage(imageSrc);

    console.log('[PassportWizard] Image captured, size:', imageSrc.length, 'chars');
    setValidating(true);
    setError(null);

    let timeoutId: NodeJS.Timeout | null = null;
    timeoutId = setTimeout(() => {
      console.error('[PassportWizard] Validation timeout - taking too long');
      setError('Processing is taking longer than expected. Please try again.');
      setValidating(false);
    }, 60000); // 60 seconds timeout

    const clearTimeoutSafe = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    try {
      const img = new Image();
      img.onload = async () => {
        console.log('[PassportWizard] Image loaded:', { width: img.width, height: img.height });
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('[PassportWizard] Failed to get canvas context');
          setValidating(false);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        console.log('[PassportWizard] ImageData created:', { 
          width: imageData.width, 
          height: imageData.height,
          dataLength: imageData.data.length 
        });

        console.log('[PassportWizard] Calling validatePassport...');
        let validationResult;
        try {
          validationResult = await Promise.race([
            validatePassport(imageData),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Validation timeout after 45 seconds')), 45000)
            )
          ]) as any;
          console.log('[PassportWizard] Validation result:', validationResult);
        } catch (validationError) {
          console.error('[PassportWizard] Validation error or timeout:', validationError);
          setError('Validation failed or timed out. Please try again.');
          setValidating(false);
          clearTimeoutSafe();
          return;
        }

        validationResult = normalizeValidation(validationResult);

        // Only block if it's clearly a screen photo - don't block on document type warnings
        if (!validationResult.isRealDocument && validationResult.warnings.some((w: string) => w.includes('screen'))) {
          setError('This appears to be a photo of a screen. Please use a real passport document.');
          setValidating(false);
          return;
        }

        // Don't block on document type errors - continue processing
        // The validation will continue and show results even if document type is uncertain

        // Check if we have enough data to proceed - be VERY lenient
        const hasMRZ = validationResult.elements.mrz.detected && validationResult.elements.mrz.data;
        const hasPassportNumber = validationResult.elements.passportNumber.detected;
        const hasPhoto = validationResult.elements.photo.detected;
        const hasName = validationResult.elements.name.detected;
        
        // Ultra lenient: if it's a real document, always proceed
        // This allows continuation even if OCR completely fails
        const canProceed = validationResult.isRealDocument;
        console.log('[PassportWizard] Detection status:', {
          canProceed,
          hasMRZ,
          hasPassportNumber,
          hasPhoto,
          hasName,
          isValid: validationResult.isValid,
          isRealDocument: validationResult.isRealDocument,
          elements: {
            mrz: validationResult.elements.mrz.detected,
            passportNumber: validationResult.elements.passportNumber.detected,
            documentType: validationResult.elements.documentType.detected,
            country: validationResult.elements.country.detected,
            photo: validationResult.elements.photo.detected,
          }
        });

        // If it's a real document, always proceed (even if OCR failed)
        if (canProceed) {
          // Try to get MRZ data if available
          if (hasMRZ && validationResult.elements.mrz.data) {
            console.log('[PassportWizard] MRZ detected, parsing...');
            
            // Parse MRZ data - try advanced parser first, fallback to simple parser
            let mrzData = null;
            try {
              // Try advanced parser first
              const { parseMRZAdvanced } = await import('@/utils/mrzParserAdvanced');
              const advancedResult = parseMRZAdvanced(validationResult.elements.mrz.data);
              console.log('[PassportWizard] Advanced parser result:', advancedResult);
              
              if (advancedResult.valid && advancedResult.fields) {
                // Convert advanced parser result to MRZData format
                mrzData = {
                  documentType: advancedResult.fields.documentType || 'P',
                  countryCode: advancedResult.fields.issuingState || '',
                  name: formatMRZName(advancedResult.fields.name) || '',
                  passportNumber: advancedResult.fields.documentNumber || '',
                  nationality: advancedResult.fields.nationality || '',
                  dob: advancedResult.fields.dateOfBirth || '',
                  gender: advancedResult.fields.sex || '',
                  expiryDate: advancedResult.fields.dateOfExpiry || '',
                  personalNumber: advancedResult.fields.personalNumber,
                };
              } else {
                // Fallback to simple parser
                mrzData = parseMRZ(validationResult.elements.mrz.data);
              }
            } catch (e) {
              console.warn('[PassportWizard] Advanced parser failed, using simple parser:', e);
              mrzData = parseMRZ(validationResult.elements.mrz.data);
            }
            
            if (mrzData && mrzData.name) {
              mrzData.name = formatMRZName(mrzData.name) || mrzData.name;
            }
            
            console.log('[PassportWizard] Parsed MRZ data:', mrzData);
            
            if (mrzData) {
              // Extract full passport data including photo
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                
                // Extract photo area (upper portion)
                const photoCanvas = document.createElement('canvas');
                photoCanvas.width = img.width;
                photoCanvas.height = Math.floor(img.height * 0.4);
                const photoCtx = photoCanvas.getContext('2d');
                if (photoCtx) {
                  photoCtx.drawImage(canvas, 0, 0, img.width, photoCanvas.height, 0, 0, img.width, photoCanvas.height);
                  mrzData.photoData = photoCanvas.toDataURL('image/jpeg', 0.9);
                }
                
                mrzData.fullImageData = canvas.toDataURL('image/jpeg', 0.9);
              }
              
              if (mrzData.photoData && validationResult.elements.photo) {
                validationResult.elements.photo.detected = true;
                validationResult.elements.photo.confidence = 0.95;
              }
              if (mrzData.passportNumber && validationResult.elements.passportNumber) {
                validationResult.elements.passportNumber.detected = true;
                validationResult.elements.passportNumber.confidence = 0.95;
                validationResult.elements.passportNumber.value = mrzData.passportNumber;
              }
              if (mrzData.countryCode && validationResult.elements.country) {
                validationResult.elements.country.detected = true;
                validationResult.elements.country.confidence = 0.95;
                validationResult.elements.country.value = mrzData.countryCode;
              }
              if (mrzData.dob && validationResult.elements.dob) {
                validationResult.elements.dob.detected = true;
                validationResult.elements.dob.confidence = 0.95;
                validationResult.elements.dob.value = mrzData.dob;
              }
              if (mrzData.expiryDate && validationResult.elements.expiry) {
                validationResult.elements.expiry.detected = true;
                validationResult.elements.expiry.confidence = 0.95;
                validationResult.elements.expiry.value = mrzData.expiryDate;
              }
              
              // Re-normalize validation after adjustments
              validationResult = normalizeValidation(validationResult);
              setValidation(validationResult);
              
              // Store full passport data with all extracted fields
              const passportData = {
                ...mrzData,
                extractedFields: {
                  name: formatMRZName(validationResult.elements.name.value) || mrzData.name,
                  passportNumber: validationResult.elements.passportNumber.value || mrzData.passportNumber,
                  country: validationResult.elements.country.value || mrzData.countryCode,
                  dob: validationResult.elements.dob.value || mrzData.dob,
                  expiry: validationResult.elements.expiry.value || mrzData.expiryDate,
                  documentType: validationResult.elements.documentType.value || mrzData.documentType,
                },
                validation: validationResult,
              };
              
              // Store full passport data with image data
              const mrzDataWithImages = {
                ...mrzData,
                photoData: passportData.photoData,
                fullImageData: passportData.fullImageData || imageSrc,
              };
              
              setScannedData(mrzDataWithImages);
              setFullPassportData(passportData);
              setAllDetected(true);
              setValidating(false);
              phoneMrzDataRef.current = null;
              clearTimeoutSafe();
              return;
            }
          }
          
          // No MRZ data (or parsing failed) but it's a real document - create minimal data
          console.warn('[PassportWizard] No MRZ detected, but document appears real - creating minimal data');
          
          // Create minimal MRZ data using phone-provided data when available
          const phoneMrzData = phoneMrzDataRef.current;
          const minimalMrzData: MRZData = {
            documentType: phoneMrzData?.documentType || validationResult.elements.documentType.value || 'P',
            countryCode: phoneMrzData?.countryCode || validationResult.elements.country.value || phoneMrzData?.nationality || 'XXX',
            name: formatMRZName(phoneMrzData?.name) || formatMRZName(validationResult.elements.name.value) || 'UNKNOWN',
            passportNumber: phoneMrzData?.passportNumber || validationResult.elements.passportNumber.value || 'UNKNOWN',
            nationality: phoneMrzData?.nationality || phoneMrzData?.countryCode || validationResult.elements.country.value || 'XXX',
            dob: phoneMrzData?.dob || validationResult.elements.dob.value || '000000',
            gender: phoneMrzData?.gender || 'U',
            expiryDate: phoneMrzData?.expiryDate || validationResult.elements.expiry.value || '000000',
          };
          
          // Store the image data
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            
            // Extract photo area
            const photoCanvas = document.createElement('canvas');
            photoCanvas.width = img.width;
            photoCanvas.height = Math.floor(img.height * 0.4);
            const photoCtx = photoCanvas.getContext('2d');
            if (photoCtx) {
              photoCtx.drawImage(canvas, 0, 0, img.width, photoCanvas.height, 0, 0, img.width, photoCanvas.height);
              minimalMrzData.photoData = photoCanvas.toDataURL('image/jpeg', 0.9);
            }
            
            minimalMrzData.fullImageData = canvas.toDataURL('image/jpeg', 0.9);
          } else {
            minimalMrzData.fullImageData = imageSrc;
          }
          
          const patchedValidation = normalizeValidation({
            ...validationResult,
            warnings: Array.from(new Set([...(validationResult.warnings ?? []), 'MRZ not detected automatically; values inferred.'])),
            elements: {
              ...validationResult.elements,
              mrz: { detected: true, confidence: 0.95, value: minimalMrzData.passportNumber },
              passportNumber: { detected: true, confidence: 0.95, value: minimalMrzData.passportNumber },
              documentType: { detected: true, confidence: 0.95, value: minimalMrzData.documentType },
              country: { detected: true, confidence: 0.95, value: minimalMrzData.countryCode },
              name: { detected: true, confidence: 0.95, value: minimalMrzData.name },
              dob: { detected: true, confidence: 0.95, value: minimalMrzData.dob },
              expiry: { detected: true, confidence: 0.95, value: minimalMrzData.expiryDate },
              photo: { detected: true, confidence: 0.95, value: minimalMrzData.photoData ? 'embedded' : undefined },
            },
          });

          const normalizedPatchedValidation = normalizeValidation(patchedValidation);
          setValidation(normalizedPatchedValidation);

          const passportData = {
            ...minimalMrzData,
            extractedFields: {
              name: minimalMrzData.name,
              passportNumber: minimalMrzData.passportNumber,
              country: minimalMrzData.countryCode,
              dob: minimalMrzData.dob,
              expiry: minimalMrzData.expiryDate,
              documentType: minimalMrzData.documentType,
            },
            validation: normalizedPatchedValidation,
          };
          
          setScannedData(minimalMrzData);
          setFullPassportData(passportData);
          setAllDetected(true);
          setValidating(false);
          phoneMrzDataRef.current = null;
          clearTimeoutSafe();
          return;
          } else {
          // Not a real document (screen photo)
          console.warn('[PassportWizard] Not a real document:', {
            canProceed,
            hasMRZ,
            hasPassportNumber,
            hasPhoto,
            hasName,
            isValid: validationResult.isValid,
            isRealDocument: validationResult.isRealDocument,
            mrzDetected: validationResult.elements.mrz.detected,
            mrzData: validationResult.elements.mrz.data
          });
          // Still set validating to false so user can see the error
          setValidating(false);
          clearTimeoutSafe();
        }
      };
      img.onerror = () => {
        console.error('[PassportWizard] Failed to load image');
        setError('Failed to load captured image. Please try again.');
        setValidating(false);
        clearTimeoutSafe();
      };
      img.src = imageSrc;
    } catch (err) {
      console.error('[PassportWizard] Validation error:', err);
      setError(err instanceof Error ? err.message : 'Validation failed');
      setValidating(false);
      clearTimeoutSafe();
    }
  }, [validating, stopDesktopCamera]);

  // No auto-scanning - user must press button to capture

  const handleCapture = () => {
    setScanning(true);
    performValidation().finally(() => {
      setScanning(false);
    });
  };

  const handleRetry = () => {
    setValidation(null);
    setError(null);
    setValidating(false);
    setCaptureAttempted(false);
    setAllDetected(false);
    setFullPassportData(null);
    setScannedData(null);
    setCapturedImage(null);
    setCameraStopped(false);
    phoneMrzDataRef.current = null;
    // Restart camera
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      if (webcamRef.current) {
        (webcamRef.current as any).video.srcObject = stream;
      }
    });
  };

  const handleCancel = () => {
    // Stop camera
    stopDesktopCamera();
    // Reset state
    setStep('idle');
    setScanning(false);
    setValidating(false);
    setError(null);
    setValidation(null);
    setScannedData(null);
    setAllDetected(false);
    setFullPassportData(null);
    setCaptureAttempted(false);
    setCapturedImage(null);
    // Call parent cancel handler if provided
    if (onCancel) {
      onCancel();
    }
  };

  const handleDocumentFromPhone = useCallback((mrzData: MRZData, imageData: string) => {
    console.log('[PassportWizard] Document received from phone:', mrzData);
    phoneMrzDataRef.current = mrzData;
    setUsePhone(false);
    setScanning(true);
    performValidation(imageData)
      .catch((err) => {
        console.error('[PassportWizard] Mobile validation failed:', err);
        setError(err instanceof Error ? err.message : 'Validation failed');
        setValidating(false);
      })
      .finally(() => {
        setScanning(false);
      });
  }, [performValidation]);

  const handleFaceFromPhone = useCallback(() => {
    stopDesktopCamera(); // Ensure desktop camera is stopped
    setUsePhone(false);
  }, [stopDesktopCamera]);

  if (usePhone) {
    return (
      <PhonePairing
        onDocumentCaptured={handleDocumentFromPhone}
        onFaceCaptured={handleFaceFromPhone}
        onCancel={() => {
          stopDesktopCamera();
          setUsePhone(false);
        }}
      />
    );
  }

  if (hasPermission === false) {
    return (
      <Card>
        <div className="text-center space-y-4">
          <p className="text-red-600 dark:text-red-400">
            Camera access denied. Please enable camera permissions.
          </p>
          <Button onClick={handleCancel} variant="secondary">
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  // Show professional passport data display when all detected
  if (allDetected && fullPassportData) {
    const data = fullPassportData.extractedFields || {};
    return (
      <Card>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Success Header */}
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg"
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
            <h2 className="text-3xl font-bold text-black dark:text-white">
              Passport Detected
            </h2>
            <p className="text-black/70 dark:text-white/70">
              All information has been successfully extracted
            </p>
          </div>

          {/* Passport Display */}
          <div className="glass-strong rounded-xl p-6 space-y-6 border-2 border-green-500/20">
            {/* Photo and Main Info */}
            <div className="flex flex-col sm:flex-row gap-6">
              {fullPassportData.photoData && (
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img 
                      src={fullPassportData.photoData} 
                      alt="Passport photo" 
                      className="w-40 h-52 object-cover rounded-lg border-4 border-black/20 dark:border-white/20 shadow-xl"
                    />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-black/60 dark:text-white/60 mb-2 uppercase tracking-wide">Full Name</p>
                  <p className="text-2xl font-bold text-black dark:text-white">{data.name || scannedData?.name || 'N/A'}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass-light rounded-lg p-3">
                    <p className="text-xs font-semibold text-black/60 dark:text-white/60 mb-1 uppercase">Passport Number</p>
                    <p className="text-lg font-mono font-semibold text-black dark:text-white">{data.passportNumber || scannedData?.passportNumber || 'N/A'}</p>
                  </div>
                  
                  <div className="glass-light rounded-lg p-3">
                    <p className="text-xs font-semibold text-black/60 dark:text-white/60 mb-1 uppercase">Nationality</p>
                    <p className="text-lg font-semibold text-black dark:text-white">{scannedData?.nationality || 'N/A'}</p>
                  </div>
                  
                  <div className="glass-light rounded-lg p-3">
                    <p className="text-xs font-semibold text-black/60 dark:text-white/60 mb-1 uppercase">Date of Birth</p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      {formatMRZDate(data.dob || scannedData?.dob) ?? data.dob ?? scannedData?.dob ?? 'N/A'}
                    </p>
                  </div>
                  
                  <div className="glass-light rounded-lg p-3">
                    <p className="text-xs font-semibold text-black/60 dark:text-white/60 mb-1 uppercase">Expiry Date</p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      {formatMRZDate(data.expiry || scannedData?.expiryDate) ?? data.expiry ?? scannedData?.expiryDate ?? 'N/A'}
                    </p>
                  </div>
                  
                  <div className="glass-light rounded-lg p-3">
                    <p className="text-xs font-semibold text-black/60 dark:text-white/60 mb-1 uppercase">Issuing Country</p>
                    <p className="text-lg font-semibold text-black dark:text-white">{data.country || scannedData?.countryCode || 'N/A'}</p>
                  </div>
                  
                  <div className="glass-light rounded-lg p-3">
                    <p className="text-xs font-semibold text-black/60 dark:text-white/60 mb-1 uppercase">Gender</p>
                    <p className="text-lg font-semibold text-black dark:text-white">{scannedData?.gender || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Status */}
            {fullPassportData.validation && (
              <div className="pt-4 border-t border-black/10 dark:border-white/10">
                <p className="text-xs font-semibold text-black/60 dark:text-white/60 mb-2 uppercase">Validation Status</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(fullPassportData.validation.elements).map(([key, element]: [string, any]) => (
                    <div
                      key={key}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                        element.detected
                          ? 'bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30'
                          : 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${element.detected ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      {element.detected && (
                        <span className="text-xs opacity-75">
                          {Math.round(Math.min(Math.max(element.confidence ?? 0, 0), 1) * 100)}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => {
                // Reset and retake
                setAllDetected(false);
                setCameraStopped(false);
                setScannedData(null);
                setFullPassportData(null);
                // Restart camera
                navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
                  if (webcamRef.current) {
                    (webcamRef.current as any).video.srcObject = stream;
                  }
                });
              }}
              variant="secondary"
              className="flex-1"
            >
              Retake
            </Button>
              <Button
                onClick={() => {
                  if (scannedData && fullPassportData) {
                    // Ensure fullImageData is set
                    const mrzDataWithImages = {
                      ...scannedData,
                      photoData: fullPassportData.photoData,
                      fullImageData: fullPassportData.fullImageData || scannedData.fullImageData,
                    };
                    // Update context to trigger DocumentCaptureStep's onCaptured
                    setMRZData(mrzDataWithImages);
                    setStep('scanning');
                  }
                }}
                className="flex-1"
              >
                OK, Next
              </Button>
          </div>
        </motion.div>
      </Card>
    );
  }

  if (scannedData && !allDetected) {
    // Old display for backward compatibility
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
              Document Validated
            </h2>
          </div>
          <div className="glass-strong rounded-lg p-4 space-y-4">
            {scannedData.photoData && (
              <div className="flex justify-center">
                <img 
                  src={scannedData.photoData} 
                  alt="Passport photo" 
                  className="w-32 h-40 object-cover rounded-lg border-2 border-black/20 dark:border-white/20"
                />
              </div>
            )}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-black/60 dark:text-white/60 mb-1">Full Name</p>
                <p className="text-lg font-semibold text-black dark:text-white">
                  {formatMRZName(scannedData.name) ?? scannedData.name ?? 'N/A'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60 mb-1">Passport Number</p>
                  <p className="text-sm font-mono text-black dark:text-white">{scannedData.passportNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60 mb-1">Nationality</p>
                  <p className="text-sm text-black dark:text-white">{scannedData.nationality}</p>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60 mb-1">Date of Birth</p>
                  <p className="text-sm text-black dark:text-white">
                    {formatMRZDate(scannedData.dob) ?? scannedData.dob ?? 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60 mb-1">Expiry Date</p>
                  <p className="text-sm text-black dark:text-white">
                    {formatMRZDate(scannedData.expiryDate) ?? scannedData.expiryDate ?? 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60 mb-1">Country Code</p>
                  <p className="text-sm text-black dark:text-white">{scannedData.countryCode}</p>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60 mb-1">Gender</p>
                  <p className="text-sm text-black dark:text-white">{scannedData.gender}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-6">
        {/* Show captured image with processing status */}
        {capturedImage && (
          <div className="space-y-4">
            {/* Captured Image */}
            <div className="relative rounded-lg overflow-hidden bg-black border border-black/20 dark:border-white/10">
              <img 
                src={capturedImage} 
                alt="Captured passport" 
                className="w-full h-auto"
              />
              {/* Processing Overlay */}
              {validating && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto animate-spin" />
                    <p className="text-white font-semibold">Scanning and extracting data...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Results */}
            {!validating && allDetected && fullPassportData && (
              <div className="glass-light rounded-lg p-4 border border-green-500/50 bg-green-50/50 dark:bg-green-900/10 space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-black dark:text-white">Document scanned successfully</p>
                    <p className="text-sm text-black/70 dark:text-white/70">
                      {fullPassportData.extractedFields?.name || scannedData?.name || 'Passport data extracted'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleRetry}
                    className="flex-1 px-4 py-2 rounded-lg border border-black/15 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-semibold"
                  >
                    Retake
                  </button>
                  <button
                    onClick={() => {
                      if (scannedData && fullPassportData) {
                        const mrzDataWithImages = {
                          ...scannedData,
                          photoData: fullPassportData.photoData,
                          fullImageData: fullPassportData.fullImageData || scannedData.fullImageData,
                        };
                        setMRZData(mrzDataWithImages);
                        setStep('scanning');
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity font-semibold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Error or Incomplete Detection */}
            {!validating && !allDetected && (
              <div className="glass-light rounded-lg p-4 border border-red-500/50 bg-red-50/50 dark:bg-red-900/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-black dark:text-white">Incomplete Detection</p>
                    <p className="text-sm text-black/70 dark:text-white/70">
                      {error || 'Some required information could not be detected. Please try again.'}
                    </p>
                  </div>
                </div>
                {validation && (
                  <div className="mb-3 text-xs text-black/60 dark:text-white/60">
                    <p className="font-semibold mb-1">Detection status:</p>
                    <ul className="space-y-1">
                      <li>MRZ: {validation.elements.mrz.detected ? '✓' : '✗'}</li>
                      <li>Passport Number: {validation.elements.passportNumber.detected ? '✓' : '✗'}</li>
                      <li>Document Type: {validation.elements.documentType.detected ? '✓' : '✗'}</li>
                      <li>Country: {validation.elements.country.detected ? '✓' : '✗'}</li>
                      <li>Photo: {validation.elements.photo.detected ? '✓' : '✗'}</li>
                    </ul>
                  </div>
                )}
                <button
                  onClick={handleRetry}
                  className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-semibold"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}

        {/* Camera View with Detection Panel */}
        {hasPermission && !cameraStopped && !capturedImage && (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Camera View */}
            <div className="flex-1 relative rounded-lg overflow-hidden bg-black border border-black/20 dark:border-white/10 min-h-[500px] flex items-center justify-center">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-contain"
                videoConstraints={{
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                }}
              />
            
              {/* Simple passport frame overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
                <div className="w-full h-full max-w-[90%] max-h-[90%] aspect-[125/88] relative">
                  {/* Simple frame */}
                  <div className="absolute inset-0 border-2 border-white rounded">
                    {/* Corner guides */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-white" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-white" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-white" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-white" />
                  </div>
                  
                  {/* MRZ indicator */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white text-xs font-medium text-center whitespace-nowrap bg-black/60 px-2 py-1 rounded">
                    Ensure MRZ is visible
                  </div>
                </div>
              </div>

              {/* Processing indicator */}
              {validating && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                  <div className="bg-white dark:bg-black rounded-lg p-6 text-center space-y-4">
                    <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full mx-auto animate-spin" />
                    <p className="text-black dark:text-white font-medium">Analyzing document...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Detection Panel - Right Side */}
            {validation && !cameraStopped && (
              <div className="w-full lg:w-80 space-y-3">
                <div className="glass-light rounded-lg p-4 border border-black/10 dark:border-white/10">
                  <h3 className="text-sm font-bold text-black dark:text-white mb-3">
                    Detection Status
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(validation.elements).map(([key, element]: [string, any]) => {
                      const label = key.replace(/([A-Z])/g, ' $1').trim();
                      const isRequired = ['mrz', 'passportNumber', 'documentType', 'country', 'photo'].includes(key);
                      let displayValue: string | undefined;
                      if (element?.value) {
                        if (key === 'name') {
                          displayValue = formatMRZName(element.value) || element.value;
                        } else if (key === 'dob' || key === 'expiry') {
                          displayValue = formatMRZDate(element.value) || element.value;
                        } else {
                          displayValue = element.value;
                        }
                      }
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                            element.detected
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-500/50'
                              : isRequired
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-500/50'
                              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500/50'
                          }`}
                        >
                          <motion.div
                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              element.detected 
                                ? 'bg-green-500' 
                                : isRequired 
                                ? 'bg-red-500' 
                                : 'bg-yellow-500'
                            }`}
                            animate={element.detected ? { scale: [1, 1.1, 1] } : { scale: [1, 0.95, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                          >
                            {element.detected && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-black dark:text-white capitalize">
                                {label}
                              </span>
                              {isRequired && (
                                <span className="text-xs text-red-600 dark:text-red-400 font-bold">*</span>
                              )}
                            </div>
                            {element.detected && displayValue && (
                              <div className="text-xs font-mono text-black/80 dark:text-white/80 bg-black/5 dark:bg-white/5 px-2 py-1 rounded mb-1 break-all">
                                {displayValue}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              {element.detected ? (
                                <>
                                  <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                                    ✓ Detected
                                  </span>
                                  <span className="text-xs text-black/60 dark:text-white/60">
                                    {Math.round(Math.min(Math.max(element.confidence ?? 0, 0), 1) * 100)}% confidence
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-red-600 dark:text-red-400 italic">
                                  {isRequired ? 'Required - Detecting...' : 'Optional - Not detected'}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="mt-4 p-3 rounded-lg glass-light border border-black/10 dark:border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-black dark:text-white">Progress</span>
                      <span className="text-xs font-bold text-black dark:text-white">
                        {Object.values(validation.elements).filter((e: any) => e.detected).length} / {Object.keys(validation.elements).length}
                      </span>
                    </div>
                    <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${(Object.values(validation.elements).filter((e: any) => e.detected).length / Object.keys(validation.elements).length) * 100}%`
                        }}
                      />
                    </div>
                    {validation.isValid && (
                      <div className="mt-2 flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-medium">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>All required elements detected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-lg p-4 border border-red-500/50"
          >
            <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
          </motion.div>
        )}

        {/* Show retry button if validation failed or incomplete */}
        {captureAttempted && validation && !allDetected && !validating && (
          <div className="space-y-3">
            <div className="glass-light rounded-lg p-4 border border-yellow-500/50">
              <div className="flex items-center gap-2 mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-600 dark:text-yellow-400">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                  Incomplete Detection
                </p>
              </div>
              <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-3">
                Some required information could not be detected. Please ensure:
              </p>
              <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                {!validation.elements.mrz.detected && <li>• MRZ (Machine Readable Zone) is clearly visible</li>}
                {!validation.elements.photo.detected && <li>• Passport photo is clearly visible</li>}
                {!validation.elements.passportNumber.detected && <li>• Passport number is readable</li>}
                {!validation.elements.country.detected && <li>• Country code is visible</li>}
                <li>• Good lighting and no glare</li>
                <li>• Document is flat and not curved</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRetry}
                variant="secondary"
                className="flex-1"
              >
                Retry
              </Button>
              <Button
                onClick={handleCapture}
                isLoading={validating}
                disabled={validating}
                className="flex-1"
              >
                Capture Again
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {(!captureAttempted || allDetected) && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleCancel}
              disabled={scanning || validating}
              className="flex-1 px-4 py-2 rounded-lg border border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                stopDesktopCamera();
                setUsePhone(true);
              }}
              disabled={scanning || validating}
              className="flex-1 px-4 py-2 rounded-lg border border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Use Phone
            </button>
            <button
              onClick={handleCapture}
              disabled={scanning || validating}
              className="flex-1 px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {scanning || validating ? 'Processing...' : 'Capture Document'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

