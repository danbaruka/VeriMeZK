import { useState, useCallback, useEffect } from 'react';

export interface LanguageSettings {
  language: string;
  dateFormat: string;
}

const DEFAULT_SETTINGS: LanguageSettings = {
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
};

const STORAGE_KEY = 'language_settings';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', available: true },
  { code: 'fr', name: 'Français', flag: '🇫🇷', available: false },
] as const;

export const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'US Format' },
  { value: 'DD/MM/YYYY', label: 'European Format' },
  { value: 'YYYY-MM-DD', label: 'ISO Format' },
] as const;

export function useLanguageSettings() {
  const [settings, setSettings] = useState<LanguageSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save language settings:', error);
    }
  }, [settings]);

  const setLanguage = useCallback((language: string) => {
    setSettings(prev => ({ ...prev, language }));
  }, []);

  const setDateFormat = useCallback((dateFormat: string) => {
    setSettings(prev => ({ ...prev, dateFormat }));
  }, []);

  return {
    settings,
    setLanguage,
    setDateFormat,
  };
}
