import { useState, useCallback } from 'react';

export type SettingsSection =
  | 'theme'
  | 'language'
  | 'export-import'
  | 'clear-data';

export function useSettingsNavigation(initialSection: SettingsSection = 'theme') {
  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const navigateToSection = useCallback(
    (section: SettingsSection, confirmCallback?: () => boolean) => {
      if (hasUnsavedChanges) {
        const shouldProceed = confirmCallback ? confirmCallback() : true;
        if (!shouldProceed) return false;
        setHasUnsavedChanges(false);
      }
      setActiveSection(section);
      return true;
    },
    [hasUnsavedChanges]
  );

  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  const clearChanges = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  return {
    activeSection,
    hasUnsavedChanges,
    navigateToSection,
    markAsChanged,
    clearChanges,
  };
}
