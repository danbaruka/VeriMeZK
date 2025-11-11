import React, { useState } from 'react';
import { useWallet } from '@meshsdk/react';
import { useVerification } from '@/contexts/VerificationContext';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { motion } from 'framer-motion';

export function TransactionSigner() {
  const { wallet, signTx } = useWallet();
  const { state, setStep, setError } = useVerification();
  const [signing, setSigning] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const signAndSubmit = async () => {
    if (!wallet || !state.proofResult) {
      setError('Wallet not connected or proof not generated');
      return;
    }

    setSigning(true);
    setError(undefined);

    try {
      // Build transaction with proof hash
      // In production, use MeshJS transaction builder
      const txBuilder = {
        recipients: [
          {
            address: import.meta.env.VITE_CONTRACT_ADDRESS || '',
            amount: 1n, // 1 lovelace minimum
          },
        ],
        metadata: {
          proofHash: state.proofResult.hash,
          clauses: state.proofResult.clauses,
          timestamp: state.proofResult.timestamp.toISOString(),
        },
      };

      // For MVP: Simulate transaction signing
      // In production: const signedTx = await wallet.signTx(txBuilder);
      // const hash = await wallet.submitTx(signedTx);
      
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Simulated transaction hash
      const simulatedHash = `0x${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;

      setTxHash(simulatedHash);
      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction signing failed');
    } finally {
      setSigning(false);
    }
  };

  if (txHash) {
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
              Verification Complete
            </h2>
            <p className="text-black/70 dark:text-white/70 mb-4">
              Your identity proof has been signed and submitted to the Midnight network
            </p>
          </div>

          <div className="glass-strong rounded-lg p-4 space-y-2">
            <p className="text-sm text-black/60 dark:text-white/60">Transaction Hash</p>
            <p className="text-xs font-mono text-black dark:text-white break-all">
              {txHash}
            </p>
          </div>

          <Button
            onClick={() => {
              setStep('idle');
              setTxHash(null);
            }}
            variant="secondary"
            className="w-full"
          >
            Start New Verification
          </Button>
        </motion.div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-black dark:text-white text-center">
          Sign Transaction
        </h2>
        <p className="text-black/70 dark:text-white/70 text-center">
          Sign the transaction to submit your proof to the Midnight network
        </p>

        {state.proofResult && (
          <div className="glass-strong rounded-lg p-4 space-y-2">
            <p className="text-sm text-black/60 dark:text-white/60">Proof Hash</p>
            <p className="text-xs font-mono text-black dark:text-white break-all">
              {state.proofResult.hash.slice(0, 20)}...
            </p>
          </div>
        )}

        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-lg p-4 border border-red-500/50"
          >
            <p className="text-red-600 dark:text-red-400">{state.error}</p>
          </motion.div>
        )}

        <Button
          onClick={signAndSubmit}
          isLoading={signing}
          disabled={signing || !wallet || !state.proofResult}
          className="w-full"
        >
          {signing ? 'Signing Transaction...' : 'Sign & Submit'}
        </Button>
      </div>
    </Card>
  );
}

