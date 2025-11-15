import { useState } from 'react';
import type { SettingsSectionProps } from '@/pages/Settings';
import { getStoredVerifications } from '@/utils/storage';

export function ExportImportSettings({ onChangesMade }: SettingsSectionProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Get all stored verifications
      const verifications = getStoredVerifications();

      // Get settings from localStorage
      const settings = {
        theme: localStorage.getItem('theme'),
        language: localStorage.getItem('language'),
        notifications: localStorage.getItem('notifications'),
        privacy: localStorage.getItem('privacy'),
      };

      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        verifications,
        settings,
      };

      // Create blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verimezk-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate data structure
      if (!data.version || !data.timestamp) {
        throw new Error('Invalid backup file format');
      }

      // Import verifications
      if (data.verifications && Array.isArray(data.verifications)) {
        const existing = getStoredVerifications();
        const merged = [...existing, ...data.verifications];
        localStorage.setItem('verifications', JSON.stringify(merged));
      }

      // Import settings
      if (data.settings) {
        Object.entries(data.settings).forEach(([key, value]) => {
          if (value) localStorage.setItem(key, value as string);
        });
      }

      onChangesMade();
      alert('Data imported successfully! Please refresh the page.');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import data. Please check the file format.');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Export & Import</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Backup and restore your verification data and settings
        </p>
      </div>

      <div className="space-y-4">
        {/* Export Data */}
        <div className="p-4 rounded-lg border border-black/20 dark:border-white/20">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-black dark:text-white mb-1">Export Data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Download all your verification proofs and settings as a JSON file
              </p>
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="px-4 py-2 text-sm font-medium text-white dark:text-black bg-black dark:bg-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? 'Exporting...' : '📥 Export All Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Import Data */}
        <div className="p-4 rounded-lg border border-black/20 dark:border-white/20">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-black dark:text-white mb-1">Import Data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Restore your data from a previously exported backup file
              </p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  disabled={isImporting}
                  className="hidden"
                />
                <span className="cursor-pointer px-4 py-2 text-sm font-medium text-white dark:text-black bg-black dark:bg-white rounded-lg hover:opacity-90 transition-all inline-block">
                  {isImporting ? 'Importing...' : '📤 Import Data'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-900 dark:text-yellow-100">
            <strong>⚠️ Important:</strong> Import will merge with existing data. To completely
            replace your data, clear all data first, then import.
          </p>
        </div>

        {/* What's Included */}
        <div className="p-4 rounded-lg border border-black/20 dark:border-white/20">
          <h3 className="font-semibold text-black dark:text-white mb-3">
            What's Included in Backups
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              Verification proofs and transaction history
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              Theme and language preferences
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              Privacy and notification settings
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400">✗</span>
              Wallet private keys (never stored)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400">✗</span>
              Biometric data (never stored)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
