import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/shared/Button';
import { TransactionSigner } from '@/components/proof/TransactionSigner';
import { useVerification } from '@/contexts/VerificationContext';

interface TransactionStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export function TransactionStep({ onComplete, onBack }: TransactionStepProps) {
  const { state } = useVerification();
  const [transactionComplete, setTransactionComplete] = useState(false);

  // Check if transaction was submitted (you'll need to add this state to your context)
  useEffect(() => {
    // This would check if transaction hash exists
    if (state.proofResult?.success && state.proofResult.transactionHash) {
      setTransactionComplete(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  }, [state.proofResult, onComplete]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="text-center space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
          Submit to Blockchain
        </h2>
        <p className="text-sm text-black/70 dark:text-white/70">
          Sign and submit your verification proof on-chain
        </p>
      </div>

      <TransactionSigner />

      {transactionComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="sm:w-5 sm:h-5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-xs sm:text-sm font-semibold">Transaction submitted successfully!</span>
          </div>
        </motion.div>
      )}

      {!transactionComplete && (
        <div className="flex gap-2 sm:gap-3 pt-2">
          <Button
            onClick={onBack}
            variant="secondary"
            className="flex-1 text-sm"
          >
            Back
          </Button>
        </div>
      )}
    </div>
  );
}

