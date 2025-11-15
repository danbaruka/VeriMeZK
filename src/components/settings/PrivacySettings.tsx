import { useState } from 'react';
import type { SettingsSectionProps } from '@/pages/Settings';

export function PrivacySettings({ onChangesMade }: SettingsSectionProps) {
  const [settings, setSettings] = useState({
    saveVerifications: true,
    saveBiometrics: false,
    shareAnalytics: false,
    autoDeleteAfter: '30',
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    onChangesMade();
  };

  const handleAutoDeleteChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      autoDeleteAfter: value,
    }));
    onChangesMade();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Privacy & Data</h2>
        <p className="text-gray-600 dark:text-gray-400">Control how your data is stored and used</p>
      </div>

      <div className="space-y-4">
        {/* Save Verifications */}
        <div className="flex items-start justify-between p-4 rounded-lg border border-black/20 dark:border-white/20">
          <div className="flex-1">
            <h3 className="font-semibold text-black dark:text-white mb-1">
              Save Verification History
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Store your verification proofs locally for quick access
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={settings.saveVerifications}
              onChange={() => handleToggle('saveVerifications')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white"></div>
          </label>
        </div>

        {/* Save Biometrics */}
        <div className="flex items-start justify-between p-4 rounded-lg border border-black/20 dark:border-white/20">
          <div className="flex-1">
            <h3 className="font-semibold text-black dark:text-white mb-1">Cache Biometric Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Temporarily store face data for faster re-verification (encrypted)
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={settings.saveBiometrics}
              onChange={() => handleToggle('saveBiometrics')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white"></div>
          </label>
        </div>

        {/* Share Analytics */}
        <div className="flex items-start justify-between p-4 rounded-lg border border-black/20 dark:border-white/20">
          <div className="flex-1">
            <h3 className="font-semibold text-black dark:text-white mb-1">
              Anonymous Usage Analytics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Help improve the app by sharing anonymous usage data
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={settings.shareAnalytics}
              onChange={() => handleToggle('shareAnalytics')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white"></div>
          </label>
        </div>

        {/* Auto Delete */}
        <div className="p-4 rounded-lg border border-black/20 dark:border-white/20">
          <h3 className="font-semibold text-black dark:text-white mb-3">Auto-Delete Old Data</h3>
          <select
            value={settings.autoDeleteAfter}
            onChange={e => handleAutoDeleteChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          >
            <option value="7">After 7 days</option>
            <option value="30">After 30 days</option>
            <option value="90">After 90 days</option>
            <option value="never">Never</option>
          </select>
        </div>

        {/* Privacy Notice */}
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>🔒 Privacy First:</strong> All verification processing happens locally on your
            device. Your biometric data never leaves your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
