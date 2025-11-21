import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useVerification } from '@/contexts/VerificationContext';
import { getStoredVerifications } from '@/utils/storage';
import { VerificationCard } from './VerificationCard';
import { FiltersSidebar } from './FiltersSidebar';
import type { StoredVerification, VerificationStatus } from '@/types';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';

export function VerificationDashboard() {
  const { address, connected } = useWalletConnection();
  const { setStep, state } = useVerification();
  // Use address from wallet connection or fallback to verification context
  const walletAddress = address || state.walletAddress;
  const [verifications, setVerifications] = useState<StoredVerification[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<{
    status?: VerificationStatus;
    dateFrom?: Date;
    dateTo?: Date;
    searchQuery: string;
  }>({
    searchQuery: '',
  });
  const [selectedVerification, setSelectedVerification] = useState<StoredVerification | null>(null);

  // Load verifications
  useEffect(() => {
    if (walletAddress) {
      const stored = getStoredVerifications(walletAddress);
      setVerifications(stored);
    }
  }, [walletAddress]);

  // Refresh verifications periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (walletAddress) {
        const stored = getStoredVerifications(walletAddress);
        setVerifications(stored);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [walletAddress]);

  // Filter and search verifications
  const filteredVerifications = useMemo(() => {
    let filtered = [...verifications];

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(v => v.status === filters.status);
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(v => v.timestamp >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(v => v.timestamp <= endDate);
    }

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(v => {
        return (
          v.proofHash.toLowerCase().includes(query) ||
          v.transactionHash?.toLowerCase().includes(query) ||
          v.clauses.some(c => c.toLowerCase().includes(query)) ||
          v.claims?.name?.toLowerCase().includes(query) ||
          v.claims?.countryCode?.toLowerCase().includes(query)
        );
      });
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [verifications, filters]);

  const handleViewDetails = (verification: StoredVerification) => {
    setSelectedVerification(verification);
  };

  const handleCloseDetails = () => {
    setSelectedVerification(null);
  };

  // Check if wallet is connected (either through hook or context)
  const isWalletConnected = connected || !!walletAddress;

  if (!isWalletConnected) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-black/70 dark:text-white/70">Please connect your wallet to view verification history</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Verification Dashboard</h1>
          <p className="text-black/70 dark:text-white/70">
            {filteredVerifications.length} {filteredVerifications.length === 1 ? 'verification' : 'verifications'}
            {filters.status || filters.dateFrom || filters.dateTo || filters.searchQuery
              ? ` (filtered from ${verifications.length})`
              : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* New Verification Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/new-proof"
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold hover:opacity-90 transition-all text-sm inline-block"
            >
              New Verification
            </Link>
          </motion.div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 glass-light rounded-lg p-1 border border-black/10 dark:border-white/10">
            <motion.button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </motion.button>
            <motion.button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </motion.button>
          </div>

          {/* Filters Button */}
          <motion.button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-4 py-2 glass-light rounded-lg border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all text-sm font-medium text-black dark:text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
            {(filters.status || filters.dateFrom || filters.dateTo) && (
              <span className="px-1.5 py-0.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs">
                {(filters.status ? 1 : 0) + (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0)}
              </span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by hash, transaction, claims, or name..."
          value={filters.searchQuery}
          onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
          className="w-full px-4 py-3 pl-11 rounded-xl glass-card border border-black/15 dark:border-white/15 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors"
        />
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        {filters.searchQuery && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setFilters({ ...filters, searchQuery: '' })}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black/60 dark:text-white/60">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </motion.button>
        )}
      </div>

      {/* Filters Sidebar */}
      <FiltersSidebar
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Verifications Grid/List */}
      {filteredVerifications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mx-auto mb-4 text-black/20 dark:text-white/20"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <p className="text-lg font-medium text-black dark:text-white mb-2">No verifications found</p>
            <p className="text-black/70 dark:text-white/70">
              {verifications.length === 0
                ? 'Complete your first verification to see it here'
                : 'Try adjusting your filters or search query'}
            </p>
          </div>
        </Card>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredVerifications.map((verification) => (
              <VerificationCard
                key={verification.id}
                verification={verification}
                onViewDetails={handleViewDetails}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedVerification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseDetails}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-modal rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-black/20 dark:border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black dark:text-white">Verification Details</h2>
                <motion.button
                  onClick={handleCloseDetails}
                  className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black dark:text-white">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </motion.button>
              </div>

              <div className="space-y-4">
                <div className="glass-light rounded-lg p-4 space-y-2">
                  <p className="text-xs font-medium text-black/70 dark:text-white/70">Proof Hash</p>
                  <p className="text-sm font-mono text-black dark:text-white break-all">
                    {selectedVerification.proofHash}
                  </p>
                </div>

                {selectedVerification.transactionHash && (
                  <div className="glass-light rounded-lg p-4 space-y-2">
                    <p className="text-xs font-medium text-black/70 dark:text-white/70">Transaction Hash</p>
                    <p className="text-sm font-mono text-black dark:text-white break-all">
                      {selectedVerification.transactionHash}
                    </p>
                  </div>
                )}

                <div className="glass-light rounded-lg p-4 space-y-2">
                  <p className="text-xs font-medium text-black/70 dark:text-white/70">Clauses</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedVerification.clauses.map((clause, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-3 py-1.5 text-sm rounded bg-black/5 dark:bg-white/5 text-black/80 dark:text-white/80 border border-black/10 dark:border-white/10"
                      >
                        {clause}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="glass-light rounded-lg p-4 space-y-2">
                  <p className="text-xs font-medium text-black/70 dark:text-white/70">Timestamp</p>
                  <p className="text-sm text-black dark:text-white">
                    {new Intl.DateTimeFormat('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    }).format(selectedVerification.timestamp)}
                  </p>
                </div>

                {selectedVerification.claims && (
                  <div className="glass-light rounded-lg p-4 space-y-3">
                    <p className="text-xs font-medium text-black/70 dark:text-white/70">Claims</p>
                    <div className="space-y-2">
                      {selectedVerification.claims.name && (
                        <div>
                          <p className="text-xs text-black/60 dark:text-white/60">Name</p>
                          <p className="text-sm text-black dark:text-white">{selectedVerification.claims.name}</p>
                        </div>
                      )}
                      {selectedVerification.claims.countryCode && (
                        <div>
                          <p className="text-xs text-black/60 dark:text-white/60">Country Code</p>
                          <p className="text-sm text-black dark:text-white">{selectedVerification.claims.countryCode}</p>
                        </div>
                      )}
                      {selectedVerification.claims.dob && (
                        <div>
                          <p className="text-xs text-black/60 dark:text-white/60">Date of Birth</p>
                          <p className="text-sm text-black dark:text-white">{selectedVerification.claims.dob}</p>
                        </div>
                      )}
                      {selectedVerification.claims.expiry && (
                        <div>
                          <p className="text-xs text-black/60 dark:text-white/60">Expiry Date</p>
                          <p className="text-sm text-black dark:text-white">{selectedVerification.claims.expiry}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

