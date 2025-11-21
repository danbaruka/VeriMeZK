import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { VerificationPage } from '@/pages/VerificationPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { MobileCapturePage } from '@/pages/MobileCapturePage';
import { ProtectedRoute } from './ProtectedRoute';

/**
 * Main application routes
 * - / : Home/Dashboard (always shows dashboard when wallet connected)
 * - /new-proof : Start new verification flow
 * - /settings : Application settings
 * - /mobile : Mobile capture page (standalone, no layout)
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Mobile capture - standalone page without header/footer */}
      <Route path="/mobile" element={<MobileCapturePage />} />

      {/* Home/Dashboard - always accessible, shows ConnectWallet if not connected */}
      <Route path="/" element={<HomePage />} />

      {/* New Proof/Verification - requires wallet connection */}
      <Route
        path="/new-proof"
        element={
          <ProtectedRoute requireWallet={true}>
            <VerificationPage />
          </ProtectedRoute>
        }
      />

      {/* Settings - accessible without wallet */}
      <Route path="/settings" element={<SettingsPage />} />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

