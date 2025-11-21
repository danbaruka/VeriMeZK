import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useVerification } from '@/contexts/VerificationContext';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';
import { AppLayout } from '@/components/layout/AppLayout';

interface ProtectedRouteProps {
  children: ReactNode;
  requireWallet?: boolean;
  redirectTo?: string;
}

/**
 * Protected route component that requires wallet connection
 * Shows ConnectWallet if wallet is not connected, otherwise renders children
 */
export function ProtectedRoute({ 
  children, 
  requireWallet = true,
  redirectTo = '/'
}: ProtectedRouteProps) {
  const { connected } = useWalletConnection();
  const { state } = useVerification();
  const location = useLocation();

  const isWalletConnected = connected || !!state.walletAddress;

  if (requireWallet && !isWalletConnected) {
    // If redirectTo is set, redirect to that path
    if (redirectTo && location.pathname !== redirectTo) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    
    // Otherwise show ConnectWallet in the layout
    return (
      <AppLayout maxWidth="2xl">
        <ConnectWallet />
      </AppLayout>
    );
  }

  return <>{children}</>;
}

