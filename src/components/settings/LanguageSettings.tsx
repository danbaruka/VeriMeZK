import { useState } from 'react';
import type { SettingsSectionProps } from '@/pages/Settings';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export function LanguageSettings({ onChangesMade }: SettingsSectionProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code);
    onChangesMade();
  };

  const handleDateFormatChange = (format: string) => {
    setDateFormat(format);
    onChangesMade();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Language & Region</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select your preferred language and regional settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Language Selection */}
        <div>
          <label className="block">
            <span className="text-sm font-medium text-black dark:text-white mb-3 block">
              Interface Language
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    selectedLanguage === lang.code
                      ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                      : 'border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-medium text-black dark:text-white">{lang.name}</span>
                  {selectedLanguage === lang.code && (
                    <span className="ml-auto text-green-600 dark:text-green-400">✓</span>
                  )}
                </button>
              ))}
            </div>
          </label>
        </div>

        {/* Date Format */}
        <div>
          <label className="block">
            <span className="text-sm font-medium text-black dark:text-white mb-3 block">
              Date Format
            </span>
            <div className="space-y-2">
              {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map(format => (
                <label
                  key={format}
                  className="flex items-center gap-3 p-3 rounded-lg border border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40 cursor-pointer transition-all"
                >
                  <input
                    type="radio"
                    name="dateFormat"
                    checked={dateFormat === format}
                    onChange={() => handleDateFormatChange(format)}
                    className="w-4 h-4"
                  />
                  <span className="text-black dark:text-white">{format}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-auto">
                    {format === 'MM/DD/YYYY' && 'US Format'}
                    {format === 'DD/MM/YYYY' && 'European Format'}
                    {format === 'YYYY-MM-DD' && 'ISO Format'}
                  </span>
                </label>
              ))}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
