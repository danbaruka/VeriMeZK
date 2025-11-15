import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { ThemeSettings } from '@/components/settings/ThemeSettings';
import { LanguageSettings } from '@/components/settings/LanguageSettings';
import { PrivacySettings } from '@/components/settings/PrivacySettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { WalletSettings } from '@/components/settings/WalletSettings';
import { ExportImportSettings } from '@/components/settings/ExportImportSettings';
import { ClearDataSettings } from '@/components/settings/ClearDataSettings';
import {
  MdPalette,
  MdLanguage,
  MdLock,
  MdNotifications,
  MdAccountBalanceWallet,
  MdImportExport,
  MdDeleteSweep,
} from 'react-icons/md';

type SettingsSection =
  | 'theme'
  | 'language'
  | 'privacy'
  | 'notifications'
  | 'wallet'
  | 'export-import'
  | 'clear-data';

interface SectionConfig {
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<SettingsSectionProps>;
}

export interface SettingsSectionProps {
  hasChanges: boolean;
  onChangesMade: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const sections: SectionConfig[] = [
  { id: 'theme', label: 'Theme', icon: MdPalette, component: ThemeSettings },
  { id: 'language', label: 'Language', icon: MdLanguage, component: LanguageSettings },
  { id: 'privacy', label: 'Privacy', icon: MdLock, component: PrivacySettings },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: MdNotifications,
    component: NotificationSettings,
  },
  { id: 'wallet', label: 'Wallet', icon: MdAccountBalanceWallet, component: WalletSettings },
  {
    id: 'export-import',
    label: 'Export/Import',
    icon: MdImportExport,
    component: ExportImportSettings,
  },
  { id: 'clear-data', label: 'Clear Data', icon: MdDeleteSweep, component: ClearDataSettings },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('theme');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSectionChange = (section: SettingsSection) => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave this section?'
      );
      if (!confirmLeave) return;
      setHasUnsavedChanges(false);
    }
    setActiveSection(section);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setHasUnsavedChanges(false);
    setIsSaving(false);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm('Are you sure you want to discard your changes?');
      if (!confirmCancel) return;
    }
    setHasUnsavedChanges(false);
    // Reset to initial state - child components will handle their own reset
  };

  const handleChangesMade = () => {
    setHasUnsavedChanges(true);
  };

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component;

  return (
    <div className="min-h-screen bg-gray-light dark:bg-gray-darker flex flex-col">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your preferences and application settings
            </p>
          </div>

          {/* Settings Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <nav className="space-y-1">
                  {sections.map(section => {
                    const IconComponent = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSectionChange(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                          activeSection === section.id
                            ? 'bg-black dark:bg-white text-white dark:text-black font-semibold shadow-md'
                            : 'text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <IconComponent className="text-xl" />
                        <span>{section.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <Card>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {ActiveComponent && (
                      <ActiveComponent
                        hasChanges={hasUnsavedChanges}
                        onChangesMade={handleChangesMade}
                        onSave={handleSave}
                        onCancel={handleCancel}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Global Save/Cancel Buttons */}
                <AnimatePresence>
                  {hasUnsavedChanges && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-6 pt-6 border-t border-black/10 dark:border-white/10 flex justify-end gap-3"
                    >
                      <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                        Cancel
                      </Button>
                      <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
                        Save Changes
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
