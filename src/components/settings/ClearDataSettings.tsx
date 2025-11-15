import { useState } from 'react';
import type { SettingsSectionProps } from '@/pages/Settings';

export function ClearDataSettings({ onChangesMade }: SettingsSectionProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const handleClearVerifications = () => {
    if (!window.confirm('Are you sure you want to delete all verification proofs?')) {
      return;
    }
    localStorage.removeItem('verifications');
    onChangesMade();
    alert('All verification proofs have been deleted');
  };

  const handleClearSettings = () => {
    if (!window.confirm('Are you sure you want to reset all settings to defaults?')) {
      return;
    }
    const keysToRemove = ['theme', 'language', 'notifications', 'privacy', 'wallet'];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    onChangesMade();
    alert('Settings have been reset. Please refresh the page.');
  };

  const handleClearCache = () => {
    if (!window.confirm('Are you sure you want to clear all cached data?')) {
      return;
    }
    // Clear session storage
    sessionStorage.clear();
    onChangesMade();
    alert('Cache has been cleared');
  };

  const handleClearAllData = async () => {
    if (confirmText !== 'DELETE ALL') {
      alert('Please type "DELETE ALL" to confirm');
      return;
    }

    if (
      !window.confirm(
        'This will permanently delete ALL data including verifications, settings, and cache. This action cannot be undone!'
      )
    ) {
      return;
    }

    setIsClearing(true);
    try {
      // Clear all localStorage
      localStorage.clear();
      // Clear all sessionStorage
      sessionStorage.clear();

      onChangesMade();
      alert('All data has been deleted. The page will now reload.');

      // Reload after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert('Failed to clear data');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Clear Data</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Delete stored data and reset application state
        </p>
      </div>

      <div className="space-y-4">
        {/* Clear Verifications */}
        <div className="p-4 rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-black dark:text-white mb-1">
                Clear Verification Proofs
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Delete all stored verification proofs and transaction history
              </p>
            </div>
          </div>
          <button
            onClick={handleClearVerifications}
            className="px-4 py-2 text-sm font-medium text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all"
          >
            Clear Verifications
          </button>
        </div>

        {/* Reset Settings */}
        <div className="p-4 rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-black dark:text-white mb-1">Reset Settings</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Restore all settings to their default values
              </p>
            </div>
          </div>
          <button
            onClick={handleClearSettings}
            className="px-4 py-2 text-sm font-medium text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all"
          >
            Reset Settings
          </button>
        </div>

        {/* Clear Cache */}
        <div className="p-4 rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-black dark:text-white mb-1">Clear Cache</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remove temporary cached data and session information
              </p>
            </div>
          </div>
          <button
            onClick={handleClearCache}
            className="px-4 py-2 text-sm font-medium text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all"
          >
            Clear Cache
          </button>
        </div>

        <hr className="border-black/10 dark:border-white/10" />

        {/* Clear All Data - Danger Zone */}
        <div className="p-4 rounded-lg border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
          <div className="mb-4">
            <h3 className="font-semibold text-red-700 dark:text-red-300 mb-1 flex items-center gap-2">
              <span>⚠️</span> Danger Zone
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400">
              This will permanently delete ALL data including verifications, settings, and cache.
              This action cannot be undone!
            </p>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
              Type <strong>DELETE ALL</strong> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="DELETE ALL"
              className="w-full px-4 py-2 rounded-lg border-2 border-red-300 dark:border-red-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            onClick={handleClearAllData}
            disabled={confirmText !== 'DELETE ALL' || isClearing}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-700 rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClearing ? 'Deleting...' : 'Delete All Data Permanently'}
          </button>
        </div>

        {/* Info */}
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>💡 Tip:</strong> Export your data before clearing to create a backup that you
            can restore later.
          </p>
        </div>
      </div>
    </div>
  );
}
