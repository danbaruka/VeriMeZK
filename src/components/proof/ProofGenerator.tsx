import React, { useState } from 'react';
import { useVerification } from '@/contexts/VerificationContext';
import { useMidnightClient } from '@/hooks/useMidnight';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { motion } from 'framer-motion';
import type { ProofResult } from '@/types';

export function ProofGenerator() {
  const { state, setProofResult, setStep, setError } = useVerification();
  const { client, loading: clientLoading } = useMidnightClient();
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateProof = async () => {
    if (!state.mrzData || !state.faceMatchScore) {
      setError('Missing verification data. Please complete previous steps.');
      return;
    }

    setGenerating(true);
    setProgress(0);
    setError(undefined);

    try {
      // Simulate proof generation progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // In production, use Midnight Dust library to generate actual ZK proof
      // For MVP, simulate proof generation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      clearInterval(progressInterval);
      setProgress(100);

      // Generate proof hash (simulated)
      const proofHash = `0x${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;

      const clauses: string[] = [];
      if (state.mrzData) {
        const dob = new Date(state.mrzData.dob);
        const age = Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365));
        if (age >= 18) clauses.push('adult:true');
        clauses.push(`country:${state.mrzData.countryCode}:true`);
        
        const expiry = new Date(state.mrzData.expiryDate);
        const daysUntilExpiry = Math.floor((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry > 180) clauses.push('validity_6m:true');
      }
      
      if (state.faceMatchScore && state.faceMatchScore >= 0.95) {
        clauses.push('facial_match:true');
      }

      const proofResult: ProofResult = {
        hash: proofHash,
        clauses,
        timestamp: new Date(),
        success: clauses.length > 0,
      };

      setProofResult(proofResult);
      setStep('signing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Proof generation failed');
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  };

  if (state.proofResult) {
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
              Proof Generated
            </h2>
          </div>

          <div className="glass-strong rounded-lg p-4 space-y-2">
            <p className="text-sm text-black/60 dark:text-white/60">Proof Hash</p>
            <p className="text-xs font-mono text-black dark:text-white break-all">
              {state.proofResult.hash}
            </p>
            <p className="text-sm text-black/60 dark:text-white/60 mt-4">Verified Claims</p>
            <ul className="list-disc list-inside space-y-1">
              {state.proofResult.clauses.map((clause, idx) => (
                <li key={idx} className="text-sm text-black dark:text-white">
                  {clause}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-black dark:text-white text-center">
          Generate Zero-Knowledge Proof
        </h2>
        <p className="text-black/70 dark:text-white/70 text-center">
          Creating a privacy-preserving proof of your identity attributes
        </p>

        {generating && (
          <div className="space-y-2">
            <div className="glass-strong rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-black dark:text-white">Generating proof...</span>
                <span className="text-sm text-black/60 dark:text-white/60">{progress}%</span>
              </div>
              <div className="w-full bg-black/20 dark:bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-black dark:bg-white h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
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
          onClick={generateProof}
          isLoading={generating || clientLoading}
          disabled={generating || clientLoading || !state.mrzData || !state.faceMatchScore}
          className="w-full"
        >
          {generating ? 'Generating Proof...' : 'Generate Proof'}
        </Button>
      </div>
    </Card>
  );
}

