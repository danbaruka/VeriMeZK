import React, { useState } from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { IconSquares } from './IconSquares';
import { useGitHubStats } from '@/hooks/useGitHubStats';
import { useWalletDetection } from '@/hooks/useWalletDetection';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import config from '@/config';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { stats, loading } = useGitHubStats();
  const { isLaceConnected, name, address, lovelace } = useWalletDetection();
  const { connected, disconnect } = useWalletConnection();
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const walletDetailsRef = React.useRef<HTMLDivElement>(null);

  // Copy address to clipboard
  const handleCopyAddress = async () => {
    if (!address) return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = address;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  // Determine if wallet button should be shown
  // Show if wallet is connected (check connected status directly, regardless of address or name)
  const shouldShowWalletButton = connected || isLaceConnected || !!address;

  // Close wallet details when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (walletDetailsRef.current && !walletDetailsRef.current.contains(event.target as Node)) {
        setShowWalletDetails(false);
      }
    };

    if (showWalletDetails) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWalletDetails]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-light border-b border-black/10 dark:border-white/10 backdrop-blur-xl safe-area-top">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <motion.a
            href="#"
            className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-black dark:text-white touch-manipulation"
            aria-label="VeriMeZK Home"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconSquares size={5} animated className="w-1.5 h-auto sm:w-2 sm:h-auto" />
            VeriMeZK
          </motion.a>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Wallet Connection Status */}
            <AnimatePresence>
              {shouldShowWalletButton && (
                <motion.div
                  ref={walletDetailsRef}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative"
                >
                  <motion.button
                    onClick={() => setShowWalletDetails(!showWalletDetails)}
                    className="flex items-center gap-2 glass-light rounded-lg px-3 py-1.5 border border-green-500/30 dark:border-green-400/30 bg-green-500/10 dark:bg-green-400/10 hover:border-green-500/50 dark:hover:border-green-400/50 transition-all touch-manipulation"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></div>
                    <span className="hidden sm:inline text-sm font-medium text-black dark:text-white">
                      {name || 'Lace'}
                    </span>
                    <span className="text-xs text-black/60 dark:text-white/60">
                      {lovelace ? (Number(lovelace) / 1000000).toFixed(2) : '0.00'} ADA
                    </span>
                  </motion.button>

                  {/* Wallet Details Dropdown */}
                  <AnimatePresence>
                    {showWalletDetails && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full mt-2 bg-white/95 dark:bg-black/80 backdrop-blur-xl rounded-lg p-4 border border-black/20 dark:border-white/20 min-w-[280px] shadow-xl dark:shadow-2xl"
                      >
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-black/70 dark:text-white/60 mb-1 font-medium">Wallet</p>
                            <p className="text-sm font-semibold text-black dark:text-white">{name || 'Lace'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-black/70 dark:text-white/60 mb-1 font-medium">Address</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-mono text-black/90 dark:text-white/90 break-all flex-1 bg-black/5 dark:bg-white/5 px-2 py-1 rounded border border-black/10 dark:border-white/10">
                                {address?.slice(0, 20)}...{address?.slice(-20)}
                              </p>
                              <motion.button
                                onClick={handleCopyAddress}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-black/5 dark:bg-white/5 rounded-lg border border-black/15 dark:border-white/15 hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/25 dark:hover:border-white/25 transition-all text-xs font-medium text-black dark:text-white"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Copy address"
                              >
                                {copied ? (
                                  <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    <span className="text-green-600 dark:text-green-400">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                    <span>Copy</span>
                                  </>
                                )}
                              </motion.button>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-black/70 dark:text-white/60 mb-1 font-medium">Balance</p>
                            <p className="text-sm font-semibold text-black dark:text-white">
                              {lovelace ? (Number(lovelace) / 1000000).toFixed(2) : '0.00'} ADA
                            </p>
                          </div>
                          <div className="flex gap-2 pt-3 border-t border-black/15 dark:border-white/15">
                            <motion.button
                              onClick={() => {
                                disconnect();
                                setShowWalletDetails(false);
                              }}
                              className="flex-1 px-3 py-2 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/20 hover:border-red-300 dark:hover:border-red-500/50 transition-all text-sm font-medium text-red-700 dark:text-red-400"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              Disconnect
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Documentation Link */}
            <motion.a
              href={config.links.documentation}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 glass-light rounded-lg px-3 py-1.5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all touch-manipulation"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-black dark:text-white"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium text-black dark:text-white">
                Docs
              </span>
            </motion.a>

            {/* GitHub Repo Link with Stats */}
            <motion.a
              href={config.github.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 glass-light rounded-lg px-3 py-1.5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all touch-manipulation"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-black dark:text-white"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium text-black dark:text-white">
                GitHub
              </span>
              {!loading && stats && (
                <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {stats.forks}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    {stats.issues}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                    {stats.commits > 0 ? (stats.commits >= 100 ? '100+' : stats.commits) : '—'}
                  </span>
                </div>
              )}
            </motion.a>

            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}

