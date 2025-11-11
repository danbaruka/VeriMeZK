import { useMemo } from 'react';
import { useWalletConnection } from './useWalletConnection';

/**
 * Hook to detect if a wallet is connected and if it's a Lace wallet
 * @returns Object with connection status and wallet information
 */
export function useWalletDetection() {
  const { connected, name, address, lovelace, isReady } = useWalletConnection();

  const walletNameLower = useMemo(() => {
    return String(name || '').toLowerCase().trim();
  }, [name]);

  const isLaceWallet = useMemo(() => {
    if (!name) return null; // Unknown if name not available
    return (
      name === 'Lace' ||
      walletNameLower === 'lace' ||
      walletNameLower.includes('lace') ||
      walletNameLower === 'lacewallet' ||
      walletNameLower === 'lace-wallet'
    );
  }, [name, walletNameLower]);

  const isConnected = useMemo(() => {
    return connected && !!address;
  }, [connected, address]);

  const isLaceConnected = useMemo(() => {
    // If wallet is connected and has address, consider it connected
    // We'll be lenient with the name check - allow if:
    // 1. No name yet (still loading)
    // 2. Name is Lace (any variation)
    // 3. Name is not explicitly a non-Lace wallet
    if (!isConnected) return false;
    
    // If no name, assume it's Lace (name might be loading)
    if (!name) return true;
    
    // If name exists, check if it's Lace
    // If isLaceWallet is null (unknown), still allow it (might be Lace)
    return isLaceWallet !== false; // Allow if true or null (unknown)
  }, [isConnected, name, isLaceWallet]);

  return {
    // Connection status
    isConnected,
    isLaceConnected,
    isLaceWallet,
    
    // Wallet info
    connected,
    name,
    address,
    lovelace,
    isReady,
    
    // Computed values
    walletNameLower,
    hasAddress: !!address,
    hasName: !!name,
  };
}

