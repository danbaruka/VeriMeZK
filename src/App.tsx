import { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MeshProvider } from '@meshsdk/react';
import '@meshsdk/react/styles.css';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { VerificationProvider } from '@/contexts/VerificationContext';
import { AppRoutes } from '@/components/routes/AppRoutes';
import { ToastProvider } from '@/contexts/ToastContext';

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

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <BrowserRouter>
          <MeshProvider>
            <VerificationProvider>
              <ToastProvider>
                <AppRoutes />
              </ToastProvider>
            </VerificationProvider>
          </MeshProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
