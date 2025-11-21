import React from 'react';
import { motion } from 'framer-motion';
import type { VerificationStepType } from './VerificationFlow';

interface Step {
  id: string;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: readonly Step[];
  currentStep: VerificationStepType;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = index < currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                {/* Step Circle - Smaller */}
                <motion.div
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs transition-all ${
                    isCompleted
                      ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
                      : isActive
                      ? 'bg-black dark:bg-white text-white dark:text-black shadow-md scale-105'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                  animate={{
                    scale: isActive ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {isCompleted ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                  
                  {/* Pulse effect for active step - Subtle */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-black dark:bg-white"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                </motion.div>

                {/* Step Label - Compact */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-xs font-medium ${
                      isActive
                        ? 'text-black dark:text-white'
                        : isCompleted
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p
                    className={`text-[10px] mt-0.5 leading-tight ${
                      isActive
                        ? 'text-black/60 dark:text-white/60'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line - Thinner */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 sm:mx-2 relative">
                  <div
                    className={`h-full ${
                      isCompleted
                        ? 'bg-green-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                  {isCompleted && (
                    <motion.div
                      className="absolute inset-0 bg-green-500"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{ transformOrigin: 'left' }}
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

