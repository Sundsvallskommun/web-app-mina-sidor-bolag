import React, { useCallback, useEffect, useRef, useState } from 'react';
import { base64ToBlob, downloadFromObjectUrl } from '@utils/file-download';

interface UsePdfDownloadOptions {
  onError: () => void;
}

interface UsePdfDownloadReturn {
  downloadPdf: (base64Data: string, invoiceNumber: string) => void;
  fallbackUrl: string | null;
  handleFallbackClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const usePdfDownload = ({ onError }: UsePdfDownloadOptions): UsePdfDownloadReturn => {
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const windowRef = useRef<Window | null>(null);
  const intervalRef = useRef<number | null>(null);

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
    (base64Data: string, invoiceNumber: string) => {
      if (fallbackUrl) {
        URL.revokeObjectURL(fallbackUrl);
      }
      try {
        const isZip = base64Data.startsWith('UEs');
        const mimeType = isZip ? 'application/zip' : 'application/pdf';
        const fileName = `${invoiceNumber}.${isZip ? 'zip' : 'pdf'}`;

        const blob = base64ToBlob(base64Data, mimeType);
        const url = URL.createObjectURL(blob);
        downloadFromObjectUrl(url, fileName);
        setFallbackUrl(url);
      } catch {
        onError();
      }
    },
    [onError, fallbackUrl]
  );

  const handleFallbackClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!fallbackUrl) return;

      const anchorHref = e.currentTarget.href;
      if (anchorHref !== fallbackUrl) {
        return;
      }

      const win = window.open(fallbackUrl, '_blank');

      if (!win) {
        return;
      }

      e.preventDefault();
      windowRef.current = win;

      intervalRef.current = window.setInterval(() => {
        if (windowRef.current && !windowRef.current.closed) return;

        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
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
