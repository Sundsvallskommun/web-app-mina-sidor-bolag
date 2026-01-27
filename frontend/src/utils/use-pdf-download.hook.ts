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
  const intervalRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fallbackUrl) {
        URL.revokeObjectURL(fallbackUrl);
      }
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
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
      if (!fallbackUrl) return;

      // Verify anchor href matches our fallbackUrl
      const anchorHref = e.currentTarget.href;
      if (anchorHref !== fallbackUrl) {
        // Mismatch detected - let the anchor handle navigation normally
        return;
      }

      // Open window and keep reference (no noopener - we need to monitor window.closed)
      const win = window.open(fallbackUrl, '_blank');

      // Handle popup blocker - if blocked, let the link work normally
      if (!win) {
        return;
      }

      // Successfully opened - prevent default navigation and track window
      e.preventDefault();
      windowRef.current = win;

      // Poll to check if window is closed
      intervalRef.current = window.setInterval(() => {
        if (windowRef.current && !windowRef.current.closed) return;

        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        // Clean up and hide link when window is closed
        URL.revokeObjectURL(fallbackUrl);
        setFallbackUrl(null);
        windowRef.current = null;
      }, 500);
    },
    [fallbackUrl]
  );

  return {
    downloadPdf,
    fallbackUrl,
    handleFallbackClick,
  };
};
