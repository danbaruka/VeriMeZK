// Camera utilities
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (error) {
    console.error('Camera permission denied:', error);
    return false;
  }
}

export function getCameraConstraints(): MediaStreamConstraints {
  return {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'environment', // Use back camera on mobile
    },
  };
}

