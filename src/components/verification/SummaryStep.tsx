import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/shared/Button';
import type { MRZData } from '@/types';

interface SummaryStepProps {
  documentData: MRZData | null;
  documentImage: string | null;
  faceImage: string | null;
  matchScore: number | null;
  onConfirm: () => void;
  onBack: () => void;
}

export function SummaryStep({
  documentData,
  documentImage,
  faceImage,
  matchScore,
  onConfirm,
  onBack,
}: SummaryStepProps) {
  if (!documentData) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-red-600 dark:text-red-400">Missing document data</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="text-center space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
          Review Your Information
        </h2>
        <p className="text-sm text-black/70 dark:text-white/70">
          Please verify all information is correct before proceeding
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
        {/* Document Image */}
        {documentImage && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-black/60 dark:text-white/60 uppercase">
              Passport Document
            </h3>
            <div className="glass-light rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
              <img
                src={documentImage}
                alt="Passport"
                className="w-full h-auto"
              />
            </div>
          </div>
        )}

        {/* Face Image */}
        {faceImage && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-black/60 dark:text-white/60 uppercase">
              Your Face
            </h3>
            <div className="glass-light rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
              <img
                src={faceImage}
                alt="Face"
                className="w-full h-auto"
              />
            </div>
            {matchScore !== null && (
              <div className="text-center">
                <span className="text-xs text-black/60 dark:text-white/60">Match Score: </span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {(matchScore * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Information */}
      <div className="glass-strong rounded-lg p-4 sm:p-5 border border-black/10 dark:border-white/10">
        <h3 className="text-xs font-semibold text-black/60 dark:text-white/60 uppercase mb-3">
          Extracted Information
        </h3>
        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-xs text-black/60 dark:text-white/60 mb-1">Full Name</p>
            <p className="text-base sm:text-lg font-semibold text-black dark:text-white">
              {documentData.name || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-black/60 dark:text-white/60 mb-1">Passport Number</p>
            <p className="text-base sm:text-lg font-mono font-semibold text-black dark:text-white">
              {documentData.passportNumber || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-black/60 dark:text-white/60 mb-1">Date of Birth</p>
            <p className="text-base sm:text-lg font-semibold text-black dark:text-white">
              {documentData.dob || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-black/60 dark:text-white/60 mb-1">Expiry Date</p>
            <p className="text-base sm:text-lg font-semibold text-black dark:text-white">
              {documentData.expiryDate || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-black/60 dark:text-white/60 mb-1">Nationality</p>
            <p className="text-base sm:text-lg font-semibold text-black dark:text-white">
              {documentData.nationality || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-black/60 dark:text-white/60 mb-1">Issuing Country</p>
            <p className="text-base sm:text-lg font-semibold text-black dark:text-white">
              {documentData.countryCode || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 sm:gap-3 pt-2">
        <Button
          onClick={onBack}
          variant="secondary"
          className="flex-1 text-sm"
        >
          Back
        </Button>
        <Button
          onClick={onConfirm}
          className="flex-1 text-sm"
        >
          Confirm & Continue
        </Button>
      </div>
    </div>
  );
}

