import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { sendMessageToDesktop, sendDocumentData, sendFaceData, sendValidationUpdate } from '@/utils/phoneConnection';
import { validatePassport } from '@/utils/passportDetection';
import { parseMRZAdvanced } from '@/utils/mrzParserAdvanced';
import { parseMRZ } from '@/utils/mrzParser';
import type { MRZData } from '@/types';
import { motion } from 'framer-motion';

export function MobileCapture() {
  // Get session ID and token from URL query params
  const getSessionParams = () => {
    if (typeof window === 'undefined') return { sessionId: '', token: '' };
    const params = new URLSearchParams(window.location.search);
    return {
      sessionId: params.get('session') || '',
      token: params.get('token') || '',
    };
  };

  // All state declarations first
  const [sessionParams] = useState(getSessionParams());
  const [mode, setMode] = useState<'document' | 'face'>('document');
  const webcamRef = useRef<Webcam>(null);
  const [scanning, setScanning] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [autoScanning, setAutoScanning] = useState(false);
  const [validation, setValidation] = useState<any>(null);
  const [documentCaptured, setDocumentCaptured] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    // Verify session token matches desktop session
    if (sessionParams.sessionId && sessionParams.token) {
      // Check if this session exists and token matches (basic validation)
      // In a real scenario, we'd verify against the desktop's session
      // For now, we'll accept it if both are present
      if (sessionParams.sessionId && sessionParams.token.length > 0) {
        setIsValidSession(true);
        setConnected(true);
        
        // Notify desktop that phone is connected - send repeatedly until confirmed
        let connectionAttempts = 0;
        const MAX_ATTEMPTS = 100; // Try for ~50 seconds (100 * 500ms)
        
        const sendConnectedMessage = () => {
          connectionAttempts++;
          console.log(`[MobileCapture] 📤 Sending connected message (attempt ${connectionAttempts}/${MAX_ATTEMPTS})`, {
            sessionId: sessionParams.sessionId.substring(0, 10) + '...',
            token: sessionParams.token.substring(0, 10) + '...',
            origin: window.location.origin
          });
          
          sendMessageToDesktop({
            type: 'connected',
            sessionId: sessionParams.sessionId,
            secretToken: sessionParams.token,
            timestamp: Date.now(),
          });
          
          // Log periodically
          if (connectionAttempts % 10 === 0) {
            console.log(`[MobileCapture] Still trying to connect... (${connectionAttempts} attempts)`);
            // Also check if messages are being stored
            try {
              const stored = localStorage.getItem('verimezk_phone_messages');
              if (stored) {
                const msgs = JSON.parse(stored);
                console.log(`[MobileCapture] Messages in localStorage: ${msgs.length}`);
                const sessionMsgs = msgs.filter((m: any) => m.sessionId === sessionParams.sessionId);
                console.log(`[MobileCapture] Messages for this session: ${sessionMsgs.length}`);
              }
            } catch (e) {
              console.error('[MobileCapture] Error checking localStorage:', e);
            }
          }
        };
        
        // Send immediately
        sendConnectedMessage();
        
        // Send every 500ms to ensure desktop receives it (more frequent)
        const connectedInterval = setInterval(() => {
          if (connectionAttempts < MAX_ATTEMPTS) {
            sendConnectedMessage();
          } else {
            console.warn('[MobileCapture] ⚠️ Max connection attempts reached. Desktop may not be listening on the same origin.');
            console.warn('[MobileCapture] Make sure desktop is using the same URL/IP as the mobile device.');
            clearInterval(connectedInterval);
          }
        }, 500);
        
        return () => {
          clearInterval(connectedInterval);
        };
      } else {
        setIsValidSession(false);
        setError('Invalid session. Please scan the QR code again.');
      }
    } else {
      setIsValidSession(false);
      setError('Missing session parameters. Please scan the QR code again.');
    }
  }, [sessionParams]);

  // Capture and process document image once
  const performDocumentValidation = useCallback(async () => {
    if (!webcamRef.current || validating || documentCaptured || mode !== 'document') {
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setError('Failed to capture image. Please try again.');
      return;
    }

    setValidating(true);
    setError(null);
    setValidation(null);

    try {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setValidating(false);
          setError('Failed to process image. Please try again.');
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Use validatePassport for professional detection
        const validationResult = await validatePassport(imageData);
        setValidation(validationResult);
        
        // Send validation update to desktop in real-time
        if (sessionParams.sessionId && sessionParams.token) {
          sendValidationUpdate(sessionParams.sessionId, sessionParams.token, validationResult);
        }

        // Check if all required elements are detected
        const requiredElements = [
          validationResult.elements.mrz.detected,
          validationResult.elements.passportNumber.detected,
          validationResult.elements.documentType.detected,
          validationResult.elements.country.detected,
          validationResult.elements.photo.detected,
        ];
        
        const allRequiredDetected = requiredElements.every(e => e) && validationResult.isValid;

        if (allRequiredDetected && validationResult.elements.mrz.data) {
          // Parse MRZ data - try advanced parser first
          let mrzData: MRZData | null = null;
          try {
            const advancedResult = parseMRZAdvanced(validationResult.elements.mrz.data);
            if (advancedResult.valid && advancedResult.fields) {
              mrzData = {
                documentType: advancedResult.fields.documentType || 'P',
                countryCode: advancedResult.fields.issuingState || '',
                name: advancedResult.fields.name || '',
                passportNumber: advancedResult.fields.documentNumber || '',
                nationality: advancedResult.fields.nationality || '',
                dob: advancedResult.fields.dateOfBirth || '',
                gender: advancedResult.fields.sex || '',
                expiryDate: advancedResult.fields.dateOfExpiry || '',
                personalNumber: advancedResult.fields.personalNumber,
              };
            } else {
              mrzData = parseMRZ(validationResult.elements.mrz.data);
            }
          } catch (e) {
            console.warn('[MobileCapture] Advanced parser failed, using simple parser:', e);
            mrzData = parseMRZ(validationResult.elements.mrz.data);
          }

          if (mrzData && mrzData.passportNumber && mrzData.name) {
            // Extract photo data
            try {
              const photoCanvas = document.createElement('canvas');
              photoCanvas.width = img.width;
              photoCanvas.height = Math.floor(img.height * 0.4);
              const photoCtx = photoCanvas.getContext('2d');
              if (photoCtx) {
                photoCtx.drawImage(canvas, 0, 0, img.width, photoCanvas.height, 0, 0, img.width, photoCanvas.height);
                mrzData.photoData = photoCanvas.toDataURL('image/jpeg', 0.9);
              }
              mrzData.fullImageData = canvas.toDataURL('image/jpeg', 0.9);
            } catch (photoErr) {
              console.warn('Failed to extract photo:', photoErr);
            }

            // All data extracted successfully
            setDocumentCaptured(true);
            sendDocumentData(sessionParams.sessionId, sessionParams.token, mrzData, imageSrc);
            setMode('face');
            setValidating(false);
            return;
          }
        }

        // Not all data detected - show retry option
        setValidating(false);
      };
      img.src = imageSrc;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
      setValidating(false);
    }
  }, [validating, documentCaptured, mode, sessionParams]);

  const captureDocument = useCallback(() => {
    if (!sessionParams.sessionId || !sessionParams.token) {
      setError('Invalid session. Please scan the QR code again.');
      return;
    }

    performDocumentValidation();
  }, [sessionParams, performDocumentValidation]);

  const retryCapture = useCallback(() => {
    setValidation(null);
    setError(null);
    setValidating(false);
  }, []);

  const captureFace = useCallback(() => {
    if (!sessionParams.sessionId || !sessionParams.token) {
      setError('Invalid session. Please scan the QR code again.');
      return;
    }

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    sendFaceData(sessionParams.sessionId, sessionParams.token, imageSrc);
    // Show success message
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
    }, 2000);
  }, [sessionParams]);

  const requestCameraPermission = useCallback(async (cameraMode: 'user' | 'environment' = mode === 'face' ? 'user' : 'environment') => {
    try {
      setPermissionError(null);
      // Request camera with specific constraints for mobile
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
    } catch (err: any) {
      console.error('Camera permission error:', err);
      setHasPermission(false);
      
      // Provide specific error messages
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Camera permission denied. Please enable camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError('No camera found. Please ensure your device has a camera.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setPermissionError('Camera is already in use by another application.');
      } else {
        setPermissionError('Failed to access camera. Please check your device settings.');
      }
    }
  }, [mode]);

  useEffect(() => {
    const cameraMode = mode === 'face' ? 'user' : 'environment';
    requestCameraPermission(cameraMode);
  }, [mode, requestCameraPermission]);

  // No auto-scanning - user must press button to capture

  if (isValidSession === false || !sessionParams.sessionId || !sessionParams.token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-light dark:bg-gray-darker">
        <div className="text-center space-y-4">
          <p className="text-red-600 dark:text-red-400">
            {error || 'Invalid session. Please scan the QR code again.'}
          </p>
          <p className="text-sm text-black/60 dark:text-white/60">
            Make sure you scanned the QR code from the desktop application.
          </p>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-light dark:bg-gray-darker">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600 dark:text-red-400">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-black dark:text-white">
              Camera Access Required
            </h2>
            <p className="text-red-600 dark:text-red-400">
              {permissionError || 'Camera access denied. Please enable camera permissions.'}
            </p>
          </div>

          <div className="space-y-3 text-left bg-white/50 dark:bg-black/50 rounded-lg p-4">
            <p className="text-sm font-semibold text-black dark:text-white">To enable camera access:</p>
            <ul className="text-sm text-black/70 dark:text-white/70 space-y-2 list-disc list-inside">
              <li><strong>Chrome/Edge:</strong> Tap the camera icon (🚫) in the address bar → Allow</li>
              <li><strong>Safari:</strong> Settings → Safari → Camera → Allow for this site</li>
              <li><strong>Firefox:</strong> Tap the lock icon → Permissions → Camera → Allow</li>
              <li>Or go to your device Settings → Apps → Browser → Permissions → Camera → Allow</li>
              <li>Refresh this page after enabling permissions</li>
            </ul>
            <p className="text-xs text-black/60 dark:text-white/60 mt-3 pt-3 border-t border-black/10 dark:border-white/10">
              <strong>Note:</strong> Make sure you're using HTTPS (not HTTP) as camera access requires a secure connection.
            </p>
          </div>

          <button
            onClick={() => {
              const cameraMode = mode === 'face' ? 'user' : 'environment';
              requestCameraPermission(cameraMode);
            }}
            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            Try Again
          </button>
          
          {typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && (
            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-500/50">
              <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
                ⚠️ Camera access requires HTTPS. Please use a secure connection (https://) or localhost.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-light dark:bg-gray-darker flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            {mode === 'document' ? 'Scan Your Document' : 'Verify Your Face'}
          </h2>
          <p className="text-black/70 dark:text-white/70">
            {mode === 'document'
              ? 'Position your passport so the MRZ is clearly visible'
              : 'Look directly at the camera'}
          </p>
        </div>

        {hasPermission && (
          <div className="relative w-full max-w-md">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded-lg"
              videoConstraints={{
                facingMode: mode === 'face' ? 'user' : 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 },
              }}
            />
            
            {/* Passport-shaped overlay for document mode */}
            {mode === 'document' && (
              <>
                <div className="absolute inset-x-6 top-8 bottom-8 flex items-center justify-center pointer-events-none">
                  <div className="relative h-full aspect-[125/88] max-w-full">
                    <div className="absolute inset-0 border-[3px] border-white/80 rounded-sm shadow-2xl" />
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white text-xs font-medium text-center whitespace-nowrap drop-shadow">
                      Align MRZ here
                    </div>
                    {/* Corner guides */}
                    <div className="absolute -top-1 -left-1 w-10 h-10 border-t-[3px] border-l-[3px] border-white/80" />
                    <div className="absolute -top-1 -right-1 w-10 h-10 border-t-[3px] border-r-[3px] border-white/80" />
                    <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-[3px] border-l-[3px] border-white/80" />
                    <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-[3px] border-r-[3px] border-white/80" />
                  </div>
                </div>
              </>
            )}

            {/* Face overlay for face mode */}
            {mode === 'face' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-4 border-white/80 rounded-full shadow-2xl" />
              </div>
            )}

            {/* Processing indicator */}
            {validating && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-black rounded-xl p-4 text-center space-y-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-4 border-black dark:border-white border-t-transparent rounded-full mx-auto"
                  />
                  <p className="text-black dark:text-white font-semibold text-sm">Scanning...</p>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-lg p-4 border border-red-500/50 max-w-md w-full"
          >
            <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
          </motion.div>
        )}

        {/* Detection Status for Document Mode */}
        {mode === 'document' && validation && (
          <div className="w-full max-w-md glass-light rounded-lg p-4 border border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-black dark:text-white">Detection Status</span>
              <span className="text-sm font-bold text-black dark:text-white">
                {Object.values(validation.elements).filter((e: any) => e.detected).length} / {Object.keys(validation.elements).length}
              </span>
            </div>
            <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 overflow-hidden mb-2">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-green-600"
                initial={{ width: 0 }}
                animate={{
                  width: `${(Object.values(validation.elements).filter((e: any) => e.detected).length / Object.keys(validation.elements).length) * 100}%`
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {validation.isValid && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-semibold"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>All elements detected!</span>
              </motion.div>
            )}
          </div>
        )}

          {mode === 'document' && !documentCaptured && (
            <div className="text-center text-xs text-black/60 dark:text-white/60">
              <p>Position your passport clearly in the frame, then tap Capture.</p>
            </div>
          )}

          {/* Show retry button if validation failed or incomplete */}
          {mode === 'document' && validation && !documentCaptured && !validating && (
            <div className="flex flex-col gap-3 w-full max-w-md">
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
                <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 mb-3">
                  {!validation.elements.mrz.detected && <li>• MRZ (Machine Readable Zone) is clearly visible</li>}
                  {!validation.elements.photo.detected && <li>• Passport photo is clearly visible</li>}
                  {!validation.elements.passportNumber.detected && <li>• Passport number is readable</li>}
                  {!validation.elements.country.detected && <li>• Country code is visible</li>}
                  <li>• Good lighting and no glare</li>
                  <li>• Document is flat and not curved</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={retryCapture}
                  className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-all"
                >
                  Retry
                </button>
                <button
                  onClick={captureDocument}
                  disabled={validating}
                  className="flex-1 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {validating ? 'Processing...' : 'Capture Again'}
                </button>
              </div>
            </div>
          )}

          {/* Show capture button when no validation or when ready */}
          {(!validation || documentCaptured) && (
            <button
              onClick={mode === 'document' ? captureDocument : captureFace}
              disabled={validating || !hasPermission || documentCaptured}
              className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {validating ? 'Processing...' : mode === 'document' ? 'Capture Document' : 'Capture Face'}
            </button>
          )}

        {connected && (
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Connected to desktop</span>
          </div>
        )}
      </div>
    </div>
  );
}

