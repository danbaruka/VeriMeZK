import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/shared/Button';
import { ProofGenerator } from '@/components/proof/ProofGenerator';
import { useVerification } from '@/contexts/VerificationContext';
import type { MRZData } from '@/types';

interface ProofGenerationStepProps {
  documentData: MRZData | null;
  onGenerated: () => void;
  onBack: () => void;
}

export function ProofGenerationStep({
  documentData,
  onGenerated,
  onBack,
}: ProofGenerationStepProps) {
  const { state, setProofResult } = useVerification();
  const [proofGenerated, setProofGenerated] = useState(false);

  useEffect(() => {
    if (state.proofResult?.success && !proofGenerated) {
      setProofGenerated(true);
      setTimeout(() => {
        onGenerated();
      }, 1000);
    }
  }, [state.proofResult, proofGenerated, onGenerated]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="text-center space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
          Generate Proof
        </h2>
        <p className="text-sm text-black/70 dark:text-white/70">
          Creating cryptographic proof of your identity verification
        </p>
      </div>

      <ProofGenerator />

      {proofGenerated && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="sm:w-5 sm:h-5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-xs sm:text-sm font-semibold">Proof generated successfully!</span>
          </div>
        </motion.div>
      )}

      {state.proofResult?.success && (
        <div className="flex gap-2 sm:gap-3 pt-2">
          <Button
            onClick={onBack}
            variant="secondary"
            className="flex-1 text-sm"
            disabled={!proofGenerated}
          >
            Back
          </Button>
          <Button
            onClick={onGenerated}
            className="flex-1 text-sm"
            disabled={!proofGenerated}
          >
            Continue to Submit
          </Button>
        </div>
      )}
    </div>
  );
}

