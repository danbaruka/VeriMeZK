import React, { Component, ErrorInfo, ReactNode } from 'react';
import { MeshProvider } from '@meshsdk/react';
import '@meshsdk/react/styles.css';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { VerificationProvider, useVerification } from '@/contexts/VerificationContext';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';
import { VerificationFlow } from '@/components/verification/VerificationFlow';
import { VerificationDashboard } from '@/components/dashboard/VerificationDashboard';
import { MobileCapture } from '@/components/scan/MobileCapture';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import NewProofPage from '@/pages/NewProofPage';
import Settings from '@/pages/Settings';
import { motion } from 'framer-motion';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="glass-card rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
              Something went wrong
            </h2>
            <pre className="text-sm text-red-600 dark:text-red-400 mb-4 overflow-auto">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-opacity"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { state, setStep } = useVerification();
  const { connected } = useWalletConnection();
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Check if wallet is connected - use connected status directly (address might not be available immediately)
  const isWalletConnected = connected || !!state.walletAddress;

  // Fix aria-hidden accessibility issue
  // Prevents aria-hidden from being set on elements that contain focusable children
  React.useEffect(() => {
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

  const renderStep = () => {
    // If wallet is not connected, show ConnectWallet
    if (!isWalletConnected && (state.step === 'idle' || state.step === 'connected')) {
      return <ConnectWallet />;
    }

    // If wallet is connected and step is idle/connected, show dashboard as main page
    if (isWalletConnected && (state.step === 'idle' || state.step === 'connected')) {
      return <VerificationDashboard />;
    }

    // Show new verification flow for all verification steps
    if (isWalletConnected && state.step !== 'idle' && state.step !== 'connected') {
      return (
        <VerificationFlow
          onComplete={() => {
            setStep('idle');
          }}
        />
      );
    }

    // Default: show ConnectWallet if not connected, dashboard if connected
    return isWalletConnected ? <VerificationDashboard /> : <ConnectWallet />;
  };

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
          className={
            isWalletConnected && (state.step === 'idle' || state.step === 'connected')
              ? 'max-w-7xl mx-auto'
              : 'max-w-2xl mx-auto'
          }
        >
          {renderStep()}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  // Check if we're on the mobile capture page
  const isMobilePage = typeof window !== 'undefined' && window.location.pathname === '/mobile';

  // Check if we're on the new proof page
  const isNewProofPage = typeof window !== 'undefined' && window.location.pathname === '/new-proof';

  // Check if we're on the settings page
  const isSettingsPage = typeof window !== 'undefined' && window.location.pathname === '/settings';

  if (isMobilePage) {
    return (
      <ErrorBoundary>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <MobileCapture />
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  if (isNewProofPage) {
    return (
      <ErrorBoundary>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <MeshProvider>
            <VerificationProvider>
              <NewProofPage />
            </VerificationProvider>
          </MeshProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  if (isSettingsPage) {
    return (
      <ErrorBoundary>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <MeshProvider>
            <VerificationProvider>
              <Settings />
            </VerificationProvider>
          </MeshProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <MeshProvider>
          <VerificationProvider>
            <AppContent />
          </VerificationProvider>
        </MeshProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
