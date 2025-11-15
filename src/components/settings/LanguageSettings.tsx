import type { SettingsSectionProps } from '@/pages/Settings';
import {
  useLanguageSettings,
  SUPPORTED_LANGUAGES,
  DATE_FORMATS,
} from '@/hooks/useLanguageSettings';

export function LanguageSettings({ onChangesMade }: SettingsSectionProps) {
  const { settings, setLanguage, setDateFormat } = useLanguageSettings();

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
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
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => lang.available && handleLanguageChange(lang.code)}
                  disabled={!lang.available}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    settings.language === lang.code
                      ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                      : lang.available
                      ? 'border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40 cursor-pointer'
                      : 'border-black/10 dark:border-white/10 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <span className="font-medium text-black dark:text-white">{lang.name}</span>
                    {!lang.available && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black rounded-full font-semibold">
                        Soon
                      </span>
                    )}
                  </div>
                  {settings.language === lang.code && lang.available && (
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
              {DATE_FORMATS.map(({ value, label }) => (
                <label
                  key={value}
                  className="flex items-center gap-3 p-3 rounded-lg border border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40 cursor-pointer transition-all"
                >
                  <input
                    type="radio"
                    name="dateFormat"
                    checked={settings.dateFormat === value}
                    onChange={() => handleDateFormatChange(value)}
                    className="w-4 h-4"
                  />
                  <span className="text-black dark:text-white">{value}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-auto">{label}</span>
                </label>
              ))}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
