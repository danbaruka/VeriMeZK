import { MobileCapture } from '@/components/scan/MobileCapture';
import { FullPageLayout } from '@/components/layout/FullPageLayout';

/**
 * Mobile capture page - standalone page for mobile device camera capture
 */
export function MobileCapturePage() {
  return (
    <FullPageLayout>
      <MobileCapture />
    </FullPageLayout>
  );
}

