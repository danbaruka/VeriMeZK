import { motion, AnimatePresence } from 'framer-motion';
import type { SettingsSection } from '@/hooks/useSettingsNavigation';
import type { SectionConfig } from '@/constants/settings';

interface SettingsContentProps {
  activeSection: SettingsSection;
  sections: SectionConfig[];
  hasChanges: boolean;
  onChangesMade: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function SettingsContent({
  activeSection,
  sections,
  hasChanges,
  onChangesMade,
  onSave,
  onCancel,
}: SettingsContentProps) {
  const ActiveComponent = sections.find(s => s.id === activeSection)?.component;

  if (!ActiveComponent) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        <ActiveComponent
          hasChanges={hasChanges}
          onChangesMade={onChangesMade}
          onSave={onSave}
          onCancel={onCancel}
        />
      </motion.div>
    </AnimatePresence>
  );
}
