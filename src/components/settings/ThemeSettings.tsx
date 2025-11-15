import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import type { SettingsSectionProps } from '@/pages/Settings';

export function ThemeSettings({ onChangesMade }: SettingsSectionProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    onChangesMade();
  };

  if (!mounted) {
    return null;
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Theme Preferences</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize the appearance of the application
        </p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-black dark:text-white mb-3 block">
            Theme Mode
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Light Theme */}
            <button
              onClick={() => handleThemeChange('light')}
              className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                theme === 'light'
                  ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                  : 'border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40'
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-white border border-gray-300 flex items-center justify-center">
                <div className="w-6 h-6 rounded bg-gray-200"></div>
              </div>
              <span className="font-medium text-black dark:text-white">Light</span>
            </button>

            {/* Dark Theme */}
            <button
              onClick={() => handleThemeChange('dark')}
              className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                theme === 'dark'
                  ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                  : 'border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40'
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center">
                <div className="w-6 h-6 rounded bg-gray-700"></div>
              </div>
              <span className="font-medium text-black dark:text-white">Dark</span>
            </button>

            {/* System Theme */}
            <button
              onClick={() => handleThemeChange('system')}
              className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                theme === 'system'
                  ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                  : 'border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40'
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-white to-gray-900 border border-gray-400 flex items-center justify-center">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-gray-200 to-gray-700"></div>
              </div>
              <span className="font-medium text-black dark:text-white">System</span>
            </button>
          </div>
        </label>

        {theme === 'system' && (
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>System theme detected:</strong> Currently using{' '}
              <span className="font-semibold">{currentTheme}</span> mode based on your system
              preferences.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
