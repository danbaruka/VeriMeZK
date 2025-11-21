import { useCallback } from 'react';
import { getStoredVerifications } from '@/utils/storage';

export interface ExportData {
  version: string;
  timestamp: string;
  verifications: any[];
  settings: Record<string, any>;
}

export function useDataManagement() {
  const exportData = useCallback(async (): Promise<void> => {
    try {
      const verifications = getStoredVerifications();

      const settings = {
        theme: localStorage.getItem('theme'),
        language: localStorage.getItem('language'),
      };

      const exportData: ExportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        verifications,
        settings,
      };

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
      throw new Error('Failed to export data');
    }
  }, []);

  const importData = useCallback(async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;

      if (!data.version || !data.timestamp) {
        throw new Error('Invalid backup file format');
      }

      if (data.verifications && Array.isArray(data.verifications)) {
        const existing = getStoredVerifications();
        const merged = [...existing, ...data.verifications];
        localStorage.setItem('verifications', JSON.stringify(merged));
      }

      if (data.settings) {
        Object.entries(data.settings).forEach(([key, value]) => {
          if (value) localStorage.setItem(key, value as string);
        });
      }
    } catch (error) {
      console.error('Import failed:', error);
      throw new Error('Failed to import data. Please check the file format.');
    }
  }, []);

  const clearVerifications = useCallback((): void => {
    localStorage.removeItem('verifications');
  }, []);

  const clearSettings = useCallback((): void => {
    const keysToRemove = [
      'theme',
      'language',
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }, []);

  const clearCache = useCallback((): void => {
    sessionStorage.clear();
  }, []);

  const clearAllData = useCallback(async (): Promise<void> => {
    try {
      localStorage.clear();
      sessionStorage.clear();

      await new Promise(resolve => setTimeout(resolve, 1000));
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw new Error('Failed to clear data');
    }
  }, []);

  return {
    exportData,
    importData,
    clearVerifications,
    clearSettings,
    clearCache,
    clearAllData,
  };
}
