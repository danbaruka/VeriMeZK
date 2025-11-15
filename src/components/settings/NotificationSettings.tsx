import { useState } from 'react';
import type { SettingsSectionProps } from '@/pages/Settings';

export function NotificationSettings({ onChangesMade }: SettingsSectionProps) {
  const [settings, setSettings] = useState({
    verificationComplete: true,
    expiryWarnings: true,
    transactionUpdates: true,
    systemAlerts: true,
    soundEnabled: false,
    desktopNotifications: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    onChangesMade();
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        handleToggle('desktopNotifications');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Notifications</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage notification preferences and alerts
        </p>
      </div>

      <div className="space-y-4">
        {/* Verification Complete */}
        <div className="flex items-start justify-between p-4 rounded-lg border border-black/20 dark:border-white/20">
          <div className="flex-1">
            <h3 className="font-semibold text-black dark:text-white mb-1">Verification Complete</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get notified when verification proof is generated
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={settings.verificationComplete}
              onChange={() => handleToggle('verificationComplete')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white"></div>
          </label>
        </div>

        {/* Expiry Warnings */}
        <div className="flex items-start justify-between p-4 rounded-lg border border-black/20 dark:border-white/20">
          <div className="flex-1">
            <h3 className="font-semibold text-black dark:text-white mb-1">
              Document Expiry Warnings
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Alert me when my document is about to expire
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={settings.expiryWarnings}
              onChange={() => handleToggle('expiryWarnings')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white"></div>
          </label>
        </div>

        {/* Transaction Updates */}
        <div className="flex items-start justify-between p-4 rounded-lg border border-black/20 dark:border-white/20">
          <div className="flex-1">
            <h3 className="font-semibold text-black dark:text-white mb-1">Transaction Updates</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Notify me about blockchain transaction status
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={settings.transactionUpdates}
              onChange={() => handleToggle('transactionUpdates')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white"></div>
          </label>
        </div>

        {/* System Alerts */}
        <div className="flex items-start justify-between p-4 rounded-lg border border-black/20 dark:border-white/20">
          <div className="flex-1">
            <h3 className="font-semibold text-black dark:text-white mb-1">System Alerts</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Important updates and security notices
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={settings.systemAlerts}
              onChange={() => handleToggle('systemAlerts')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white"></div>
          </label>
        </div>

        <hr className="border-black/10 dark:border-white/10" />

        {/* Sound */}
        <div className="flex items-start justify-between p-4 rounded-lg border border-black/20 dark:border-white/20">
          <div className="flex-1">
            <h3 className="font-semibold text-black dark:text-white mb-1">Sound Effects</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Play sounds for notifications
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={() => handleToggle('soundEnabled')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white"></div>
          </label>
        </div>

        {/* Desktop Notifications */}
        <div className="flex items-start justify-between p-4 rounded-lg border border-black/20 dark:border-white/20">
          <div className="flex-1">
            <h3 className="font-semibold text-black dark:text-white mb-1">Desktop Notifications</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Show system notifications outside the browser
            </p>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="px-4 py-2 text-sm font-medium text-black dark:text-white border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            {settings.desktopNotifications ? 'Enabled' : 'Enable'}
          </button>
        </div>
      </div>
    </div>
  );
}
