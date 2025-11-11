import React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-light border-b border-black/10 dark:border-white/10 backdrop-blur-xl safe-area-top">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <motion.a
            href="#"
            className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-black dark:text-white touch-manipulation"
            aria-label="VeriMeZK Home"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            VeriMeZK
          </motion.a>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}

