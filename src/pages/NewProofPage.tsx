import React, { useEffect } from 'react';
import { useVerification } from '@/contexts/VerificationContext';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { VerificationFlow } from '@/components/verification/VerificationFlow';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { motion } from 'framer-motion';

function NewProofPage() {
  const { state, setStep } = useVerification();
  const { connected } = useWalletConnection();
  const isWalletConnected = connected || !!state.walletAddress;

  // Set step to scanning when wallet is connected
  useEffect(() => {
    if (isWalletConnected && state.step === 'idle') {
      setStep('scanning');
    }
  }, [isWalletConnected, state.step, setStep]);

  return (
    <div className="min-h-screen bg-gray-light dark:bg-gray-darker flex flex-col">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {!isWalletConnected ? (
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
                Create New Proof
              </h1>
              <p className="text-black/70 dark:text-white/70 mb-8">
                Connect your wallet to start the verification process
              </p>
              <ConnectWallet />
            </div>
          ) : (
            <VerificationFlow
              onComplete={() => {
                // Redirect to dashboard after completion
                // Redirect handled by VerificationPage component
              }}
            />
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

export default NewProofPage;

