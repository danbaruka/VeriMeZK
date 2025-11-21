import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVerification } from '@/contexts/VerificationContext';
import { Card } from '@/components/shared/Card';
import { StepIndicator } from './StepIndicator';
import { DocumentCaptureStep } from './DocumentCaptureStep';
import { FaceCaptureStep } from './FaceCaptureStep';
import { FaceMatchStep } from './FaceMatchStep';
import { SummaryStep } from './SummaryStep';
import { ProofGenerationStep } from './ProofGenerationStep';
import { TransactionStep } from './TransactionStep';
import type { MRZData } from '@/types';

export type VerificationStepType = 
  | 'document' 
  | 'face' 
  | 'matching' 
  | 'summary' 
  | 'proof' 
  | 'transaction' 
  | 'complete';

interface VerificationFlowProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

const steps = [
  { id: 'document', title: 'Document', description: 'Scan passport' },
  { id: 'face', title: 'Face', description: 'Capture face' },
  { id: 'matching', title: 'Verification', description: 'Match faces' },
  { id: 'summary', title: 'Review', description: 'Review data' },
  { id: 'proof', title: 'Proof', description: 'Generate proof' },
  { id: 'transaction', title: 'Submit', description: 'Submit on-chain' },
] as const;

export function VerificationFlow({ onComplete, onCancel }: VerificationFlowProps) {
  const { state, setMRZData, setStep } = useVerification();
  const [currentStep, setCurrentStep] = useState<VerificationStepType>('document');
  const [documentData, setDocumentData] = useState<MRZData | null>(null);
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [faceMatchScore, setFaceMatchScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDocumentCaptured = useCallback((mrzData: MRZData, imageData: string) => {
    setDocumentData(mrzData);
    setDocumentImage(imageData);
    setError(null);
    setCurrentStep('face');
    setMRZData(mrzData);
    setStep('scanning'); // Update context step
  }, [setMRZData, setStep]);

  const handleDocumentRetry = useCallback(() => {
    setDocumentData(null);
    setDocumentImage(null);
    setError(null);
    // Stay on document step
  }, []);

  const handleFaceCaptured = useCallback((imageData: string) => {
    setFaceImage(imageData);
    setError(null);
    setCurrentStep('matching');
  }, []);

  const handleFaceRetry = useCallback(() => {
    setFaceImage(null);
    setError(null);
    // Stay on face step
  }, []);

  const handleFaceMatched = useCallback((score: number) => {
    setFaceMatchScore(score);
    if (score >= 0.7) {
      setError(null);
      setCurrentStep('summary');
      setStep('verifying'); // Update context step
    } else {
      setError(`Face match score too low: ${(score * 100).toFixed(1)}%. Minimum required: 70%. Please try again.`);
      setCurrentStep('face');
      setFaceImage(null);
    }
  }, [setStep]);

  const handleSummaryConfirmed = useCallback(() => {
    setCurrentStep('proof');
    setStep('proving'); // Update context step
  }, [setStep]);

  const handleProofGenerated = useCallback(() => {
    setCurrentStep('transaction');
    setStep('signing'); // Update context step
  }, [setStep]);

  const handleTransactionComplete = useCallback(() => {
    setCurrentStep('complete');
    if (onComplete) {
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  }, [onComplete]);

  const renderStep = () => {
    switch (currentStep) {
      case 'document':
        return (
          <DocumentCaptureStep
            onCaptured={handleDocumentCaptured}
            onRetry={handleDocumentRetry}
            onCancel={onCancel}
            error={error}
          />
        );
      case 'face':
        return (
          <FaceCaptureStep
            onCaptured={handleFaceCaptured}
            onRetry={handleFaceRetry}
            error={error}
          />
        );
      case 'matching':
        return (
          <FaceMatchStep
            passportImage={documentImage}
            faceImage={faceImage}
            onMatched={handleFaceMatched}
            error={error}
          />
        );
      case 'summary':
        return (
          <SummaryStep
            documentData={documentData}
            documentImage={documentImage}
            faceImage={faceImage}
            matchScore={faceMatchScore}
            onConfirm={handleSummaryConfirmed}
            onBack={() => setCurrentStep('matching')}
          />
        );
      case 'proof':
        return (
          <ProofGenerationStep
            documentData={documentData}
            onGenerated={handleProofGenerated}
            onBack={() => setCurrentStep('summary')}
          />
        );
      case 'transaction':
        return (
          <TransactionStep
            onComplete={handleTransactionComplete}
            onBack={() => setCurrentStep('proof')}
          />
        );
      case 'complete':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-8 sm:py-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="sm:w-12 sm:h-12">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-2">
                Verification Complete!
              </h2>
              <p className="text-sm sm:text-base text-black/70 dark:text-white/70">
                Your identity has been verified and submitted to the blockchain.
              </p>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Step Indicator - Compact */}
      <div className="mb-4 sm:mb-5">
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
        />
      </div>

      {/* Main Content - Reduced padding */}
      <Card>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}

