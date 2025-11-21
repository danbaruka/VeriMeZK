import { Card } from '@/components/shared/Card';
import { ToastProvider } from '@/contexts/ToastContext';
import { useToast } from '@/contexts/ToastContext';
import { useConfirmation } from '@/hooks/useConfirmation';
import { useSettingsNavigation } from '@/hooks/useSettingsNavigation';
import { useSettingsSave } from '@/hooks/useSettingsSave';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { SettingsContent } from '@/components/settings/SettingsContent';
import { SettingsActions } from '@/components/settings/SettingsActions';
import { SETTINGS_SECTIONS } from '@/constants/settings';
import { AppLayout } from '@/components/layout/AppLayout';

export type { SettingsSectionProps } from '@/constants/settings';

/**
 * Settings page - manages application settings and preferences
 */
function SettingsPageContent() {
  const toast = useToast();
  const confirmation = useConfirmation();
  const { isSaving, save } = useSettingsSave();
  const { activeSection, hasUnsavedChanges, navigateToSection, markAsChanged, clearChanges } =
    useSettingsNavigation();

  const handleSectionChange = (section: typeof activeSection) => {
    if (hasUnsavedChanges) {
      confirmation.confirm(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave this section?',
        () => {
          clearChanges();
          navigateToSection(section);
        },
        'warning'
      );
    } else {
      navigateToSection(section);
    }
  };

  const handleSave = async () => {
    await save(() => {
      clearChanges();
      toast.success('Settings saved successfully');
    });
  };

  const handleCancel = () => {
    confirmation.confirm(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      () => {
        clearChanges();
        toast.info('Changes discarded');
      },
      'warning'
    );
  };

  return (
    <>
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your preferences and application settings
        </p>
      </header>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-1">
          <Card className="sticky top-24">
            <SettingsSidebar
              sections={SETTINGS_SECTIONS}
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
            />
          </Card>
        </aside>

        {/* Main Content Area */}
        <section className="lg:col-span-3">
          <Card>
            <SettingsContent
              activeSection={activeSection}
              sections={SETTINGS_SECTIONS}
              hasChanges={hasUnsavedChanges}
              onChangesMade={markAsChanged}
              onSave={handleSave}
              onCancel={handleCancel}
            />

            <SettingsActions
              hasChanges={hasUnsavedChanges}
              isSaving={isSaving}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </Card>
        </section>
      </div>

      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        onConfirm={confirmation.handleConfirm}
        onCancel={confirmation.handleCancel}
        variant={confirmation.variant}
      />
    </>
  );
}

export function SettingsPage() {
  return (
    <AppLayout maxWidth="7xl">
      <ToastProvider>
        <SettingsPageContent />
      </ToastProvider>
    </AppLayout>
  );
}

