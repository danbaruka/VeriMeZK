import React, { useState } from 'react';
import { CardanoWallet } from '@meshsdk/react';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useVerification } from '@/contexts/VerificationContext';
import { Card } from '@/components/shared/Card';
import { motion, AnimatePresence } from 'framer-motion';

export function ConnectWallet() {
  const { connected, name, address, disconnect } = useWalletConnection();
  const { setWalletInfo, state } = useVerification();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Also check if wallet info is already set in verification context
  const hasWalletInContext = !!state.walletAddress;

  const handleConnected = (walletName: string) => {
    // Debug: log the wallet name to see what we're getting
    console.log('onConnected callback - wallet name:', walletName, 'type:', typeof walletName);
    
    // Don't disconnect here - let the useEffect handle the check
    // The onConnected callback might be called before the wallet name is fully available
    // We'll verify in the useEffect hook instead
  };

  // Handle wallet connection/disconnection
  React.useEffect(() => {
    // Wallet disconnected
    if (!connected) {
      console.log('Wallet disconnected');
      setErrorMessage(null);
      return;
    }

    // Wallet connected - wait for address to be available, then verify it's Lace
    console.log('Wallet connection detected:', {
      connected,
      hasAddress: !!address,
      name,
      nameType: typeof name,
    });
    
    // Wait for address to be available
    if (!address) {
      console.log('⏳ Wallet connected but address not available yet, waiting...');
      return; // Will re-run when address becomes available
    }
    
    // Address is now available - verify it's Lace
    // If we have a wallet name, check if it's Lace
    if (name && name !== 'Unknown') {
      const walletNameLower = String(name).toLowerCase().trim();
      const isLace = walletNameLower === 'lace' || 
                      walletNameLower.includes('lace') ||
                      walletNameLower === 'lacewallet' ||
                      walletNameLower === 'lace-wallet';
      
      if (isLace) {
        console.log('✅ Lace wallet verified, setting wallet info');
        setWalletInfo(address, name);
        setErrorMessage(null);
      } else {
        // Only reject if we have a clear non-Lace wallet name
        console.log('❌ Rejected wallet:', walletNameLower);
        disconnect();
        setErrorMessage('Only Lace wallet is currently supported. Other wallets coming soon!');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } else if (!name) {
      // If name is not available yet, wait a bit and check again
      console.log('⏳ Wallet connected but name not available yet, waiting...');
      const timeout = setTimeout(() => {
        if (connected && address) {
          if (!name) {
            console.log('✅ Wallet name still not available after timeout, allowing connection (assuming Lace)');
            // Allow it through if name is still not available - assume it might be Lace
            setWalletInfo(address, 'Lace');
            setErrorMessage(null);
          } else {
            // Name became available during timeout, re-check
            const walletNameLower = String(name).toLowerCase().trim();
            const isLace = walletNameLower === 'lace' || 
                            walletNameLower.includes('lace') ||
                            walletNameLower === 'lacewallet' ||
                            walletNameLower === 'lace-wallet';
            
            if (isLace) {
              console.log('✅ Lace wallet verified after timeout');
              setWalletInfo(address, name);
              setErrorMessage(null);
            } else {
              console.log('❌ Rejected wallet after timeout:', walletNameLower);
              disconnect();
              setErrorMessage('Only Lace wallet is currently supported. Other wallets coming soon!');
              setTimeout(() => setErrorMessage(null), 5000);
            }
          }
        }
      }, 2000); // Wait 2 seconds for wallet name to load
      
      return () => clearTimeout(timeout);
    }
  }, [connected, address, name, setWalletInfo, disconnect]);

  // If wallet is connected, don't show the connect card - it's shown in the header
  // Simply check if connected is true (regardless of address or name)
  // Address might not be available immediately, but if connected is true, wallet is connecting/connected
  if (connected || hasWalletInContext) {
    console.log('Hiding Connect Wallet card - wallet is connected', {
      connected,
      hasAddress: !!address,
      hasWalletInContext,
      name,
    });
    return null;
  }
  
  console.log('Showing Connect Wallet card - wallet not connected', {
    connected,
    hasAddress: !!address,
    hasWalletInContext,
  });

  return (
    <Card>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-black dark:text-white text-center">
          Connect Your Wallet
        </h2>
        <p className="text-black/70 dark:text-white/70 text-center">
          Connect your Cardano wallet to begin identity verification
        </p>
        <div className="glass-light rounded-lg p-3 border border-yellow-500/30 bg-yellow-500/10">
          <p className="text-sm text-yellow-700 dark:text-yellow-400 text-center">
            ⚠️ Currently only Lace wallet is supported. Other wallets coming soon!
          </p>
        </div>

        <AnimatePresence mode="wait">
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-strong rounded-lg p-4 border border-red-500/50 bg-red-500/10"
              role="alert"
              aria-live="polite"
              aria-atomic="true"
            >
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {errorMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center">
          <CardanoWallet
            label="Connect Wallet"
            persist={true}
            onConnected={handleConnected}
            isDark={true}
          />
        </div>
      </motion.div>
    </Card>
  );
}
