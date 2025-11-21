import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  // Check if padding is explicitly set in className
  const hasCustomPadding = /p-\d+|p-[a-z]/.test(className);
  const defaultPadding = hasCustomPadding ? '' : 'p-4 sm:p-5';
  
  return (
    <motion.div
      className={`glass-card rounded-xl ${defaultPadding} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

