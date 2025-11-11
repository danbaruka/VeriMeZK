import React from 'react';
import { motion } from 'framer-motion';
import config from '@/config';

export function Footer() {
  return (
    <footer className="border-t border-black/10 dark:border-white/10 bg-gray-light dark:bg-gray-darker">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm text-black/60 dark:text-white/60"
        >
          <a
            href={config.app.landingPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black dark:text-white hover:underline font-medium transition-colors"
          >
            VeriMeZK.org
          </a>
          <span className="mx-2">•</span>
          <span>Open source managed by </span>
          <a
            href={config.github.orgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black dark:text-white hover:underline font-medium transition-colors"
          >
            Uptodate Develoeprs
          </a>
          <span className="mx-2">•</span>
          <span>Powered by </span>
          <a
            href={config.links.midnightNetwork}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black dark:text-white hover:underline font-medium transition-colors"
          >
            Midnight
          </a>
        </motion.div>
      </div>
    </footer>
  );
}

