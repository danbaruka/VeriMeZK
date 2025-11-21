import { VerificationDashboard } from '@/components/dashboard/VerificationDashboard';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useVerification } from '@/contexts/VerificationContext';
import { AppLayout } from '@/components/layout/AppLayout';

/**
 * Home page - always shows dashboard when wallet is connected, otherwise shows ConnectWallet
 */
export function HomePage() {
  const { connected } = useWalletConnection();
  const { state } = useVerification();

  const isWalletConnected = connected || !!state.walletAddress;

  return (
    <AppLayout maxWidth="7xl">
      {isWalletConnected ? <VerificationDashboard /> : <ConnectWallet />}
    </AppLayout>
  );
}

