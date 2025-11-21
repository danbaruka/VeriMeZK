import { ReactNode } from 'react';

interface FullPageLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Full page layout without header/footer - used for mobile capture and other standalone pages
 */
export function FullPageLayout({ children, className = '' }: FullPageLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-light dark:bg-gray-darker ${className}`}>
      {children}
    </div>
  );
}

