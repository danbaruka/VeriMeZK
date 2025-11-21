import { ReactNode, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

interface AppLayoutProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

export function AppLayout({ children, maxWidth = '7xl', className = '' }: AppLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Fix aria-hidden accessibility issue
  // Prevents aria-hidden from being set on elements that contain focusable children
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
          const target = mutation.target as HTMLElement;

          // Only fix if aria-hidden is being set to true
          if (target.getAttribute('aria-hidden') !== 'true') return;

          // Skip if it's a backdrop/overlay (these should be aria-hidden)
          if (
            target.classList.contains('backdrop-blur-sm') ||
            target.classList.contains('bg-black') ||
            target.classList.contains('bg-black/50')
          ) {
            return;
          }

          // Check if the element or its immediate children contain focusable elements
          const hasFocusableElements = Array.from(
            target.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          ).some(el => {
            // Check if the focusable element is actually visible and not in a modal overlay
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          });

          // If aria-hidden is set but element has visible focusable children, remove it
          if (hasFocusableElements) {
            // Use requestAnimationFrame to avoid interfering with React's rendering
            requestAnimationFrame(() => {
              if (target.getAttribute('aria-hidden') === 'true') {
                target.removeAttribute('aria-hidden');
              }
            });
          }
        }
      });
    });

    observer.observe(container, {
      attributes: true,
      attributeFilter: ['aria-hidden'],
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-light dark:bg-gray-darker flex flex-col"
    >
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${maxWidthClasses[maxWidth]} mx-auto ${className}`}
        >
          {children}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

