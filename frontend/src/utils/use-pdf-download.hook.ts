import { useCallback, useEffect, useRef, useState } from 'react';
import { base64ToBlob, downloadFromObjectUrl } from '@utils/file-download';

interface UsePdfDownloadOptions {
  onError: () => void;
}

interface UsePdfDownloadReturn {
  downloadPdf: (base64Data: string, fileName: string) => void;
  fallbackUrl: string | null;
  handleFallbackClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Custom hook for handling PDF downloads with fallback link support.
 * Manages object URL creation, cleanup, and fallback window tracking.
 */
export const usePdfDownload = ({ onError }: UsePdfDownloadOptions): UsePdfDownloadReturn => {
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const windowRef = useRef<Window | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fallbackUrl) {
        URL.revokeObjectURL(fallbackUrl);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fallbackUrl]);

  const downloadPdf = useCallback(
    (base64Data: string, fileName: string) => {
      try {
        const blob = base64ToBlob(base64Data, 'application/pdf');
        const url = URL.createObjectURL(blob);
        downloadFromObjectUrl(url, fileName);
        setFallbackUrl(url);
      } catch {
        onError();
      }
    },
    [onError]
  );

  const handleFallbackClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (fallbackUrl) {
        // Open window and keep reference
        windowRef.current = window.open(fallbackUrl, '_blank');

        // Poll to check if window is closed
        intervalRef.current = setInterval(() => {
          if (windowRef.current?.closed) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            // Clean up and hide link when window is closed
            URL.revokeObjectURL(fallbackUrl);
            setFallbackUrl(null);
            windowRef.current = null;
          }
        }, 500);
      }
    },
    [fallbackUrl]
  );

  return {
    downloadPdf,
    fallbackUrl,
    handleFallbackClick,
  };
};
