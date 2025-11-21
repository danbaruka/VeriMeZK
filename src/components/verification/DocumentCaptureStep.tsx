import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PassportWizard } from '@/components/scan/PassportWizard';
import { PhonePairing } from '@/components/scan/PhonePairing';
import { useVerification } from '@/contexts/VerificationContext';
import type { MRZData } from '@/types';
import { Card } from '@/components/shared/Card';

interface DocumentCaptureStepProps {
  onCaptured: (mrzData: MRZData, imageData: string) => void;
  onRetry: () => void;
  onCancel?: () => void;
  error: string | null;
}

export function DocumentCaptureStep({ onCaptured, onRetry, onCancel, error }: DocumentCaptureStepProps) {
  const [usePhone, setUsePhone] = useState(false);
  const { state } = useVerification();

  // Listen for document capture from PassportWizard
  useEffect(() => {
    if (state.mrzData && state.step === 'scanning') {
      const imageData = state.mrzData.fullImageData || '';
      // Only proceed if we have MRZ data and image data
      if (state.mrzData.passportNumber && state.mrzData.name && imageData) {
        console.log('[DocumentCaptureStep] Document captured, proceeding to next step');
        // Small delay to ensure state is stable
        const timer = setTimeout(() => {
          // Ensure mrzData is defined before calling onCaptured
          if (state.mrzData) {
            onCaptured(state.mrzData, imageData);
          }
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [state.mrzData, state.step, onCaptured]);

  const handleDocumentFromPhone = useCallback((mrzData: MRZData, imageData: string) => {
    onCaptured(mrzData, imageData);
    setUsePhone(false);
  }, [onCaptured]);

  const handleCancelPhone = useCallback(() => {
    setUsePhone(false);
  }, []);

  if (usePhone) {
    return (
      <PhonePairing
        onDocumentCaptured={handleDocumentFromPhone}
        onFaceCaptured={() => {}}
        onCancel={handleCancelPhone}
      />
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Header Section - Compact */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white tracking-tight">
          Scan Your Passport
        </h2>
        <p className="text-sm sm:text-base text-black/70 dark:text-white/70 max-w-xl mx-auto">
          Position your passport clearly in the frame. Ensure good lighting and the MRZ is visible at the bottom.
        </p>
      </motion.div>

      {/* Main Capture Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <PassportWizard onCancel={onCancel} />
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="glass-strong rounded-xl p-3 sm:p-4 border-2 border-red-500/50 bg-red-50/50 dark:bg-red-900/10"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-red-600 dark:text-red-400"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-red-900 dark:text-red-100 mb-1">
                  Capture Error
                </h3>
                <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 leading-relaxed">
                  {error}
                </p>
                <button
                  onClick={onRetry}
                  className="mt-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center"
      >
        <p className="text-xs sm:text-sm text-black/50 dark:text-white/50">
          Having trouble?{' '}
          <button
            onClick={() => setUsePhone(true)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold underline underline-offset-2 transition-colors"
          >
            Use your phone camera instead
          </button>
        </p>
      </motion.div>
    </div>
  );
}
