import React, { Component, ErrorInfo, ReactNode } from 'react';
import { MeshProvider } from '@meshsdk/react';
import '@meshsdk/react/styles.css';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { VerificationProvider, useVerification } from '@/contexts/VerificationContext';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';
import { DocumentScanner } from '@/components/scan/DocumentScanner';
import { FaceVerification } from '@/components/scan/FaceVerification';
import { ProofGenerator } from '@/components/proof/ProofGenerator';
import { TransactionSigner } from '@/components/proof/TransactionSigner';
import { Header } from '@/components/shared/Header';
import { motion } from 'framer-motion';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
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

function VerificationFlow() {
  const { state } = useVerification();

  const renderStep = () => {
    switch (state.step) {
      case 'idle':
      case 'connected':
        return <ConnectWallet />;
      case 'scanning':
        return <DocumentScanner />;
      case 'verifying':
        return <FaceVerification />;
      case 'proving':
        return <ProofGenerator />;
      case 'signing':
        return <TransactionSigner />;
      case 'complete':
        return <TransactionSigner />;
      default:
        return <ConnectWallet />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-light dark:bg-gray-darker">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {renderStep()}
        </motion.div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <MeshProvider>
          <VerificationProvider>
            <VerificationFlow />
          </VerificationProvider>
        </MeshProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

