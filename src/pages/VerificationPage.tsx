import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VerificationFlow } from '@/components/verification/VerificationFlow';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useVerification } from '@/contexts/VerificationContext';
import { AppLayout } from '@/components/layout/AppLayout';

/**
 * Verification/New Proof page - handles the full verification flow
 */
export function VerificationPage() {
  const navigate = useNavigate();
  const { connected } = useWalletConnection();
  const { state, setStep } = useVerification();

  const isWalletConnected = connected || !!state.walletAddress;

  // Set step to scanning when wallet is connected
  useEffect(() => {
    if (isWalletConnected && state.step === 'idle') {
      setStep('scanning');
    }
  }, [isWalletConnected, state.step, setStep]);

  const handleComplete = () => {
    // Redirect to dashboard after completion
    navigate('/', { replace: true });
  };

  const handleCancel = () => {
    // Redirect to dashboard when user cancels
    navigate('/', { replace: true });
  };

  if (!isWalletConnected) {
    return (
      <AppLayout maxWidth="2xl">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
            Create New Proof
          </h1>
          <p className="text-black/70 dark:text-white/70 mb-8">
            Connect your wallet to start the verification process
          </p>
          <ConnectWallet />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout maxWidth="4xl" className="py-4">
      <VerificationFlow onComplete={handleComplete} onCancel={handleCancel} />
    </AppLayout>
  );
}

