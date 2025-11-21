import type { SettingsSection } from '@/hooks/useSettingsNavigation';
import {
  MdPalette,
  MdLanguage,
  MdImportExport,
  MdDeleteSweep,
} from 'react-icons/md';
import { ThemeSettings } from '@/components/settings/ThemeSettings';
import { LanguageSettings } from '@/components/settings/LanguageSettings';
import { ExportImportSettings } from '@/components/settings/ExportImportSettings';
import { ClearDataSettings } from '@/components/settings/ClearDataSettings';

export interface SettingsSectionProps {
  hasChanges: boolean;
  onChangesMade: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export interface SectionConfig {
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<SettingsSectionProps>;
}

export const SETTINGS_SECTIONS: SectionConfig[] = [
  { id: 'theme', label: 'Theme', icon: MdPalette, component: ThemeSettings },
  { id: 'language', label: 'Language', icon: MdLanguage, component: LanguageSettings },
  {
    id: 'export-import',
    label: 'Export/Import',
    icon: MdImportExport,
    component: ExportImportSettings,
  },
  { id: 'clear-data', label: 'Clear Data', icon: MdDeleteSweep, component: ClearDataSettings },
];
