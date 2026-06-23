import { IInvoice } from '@interfaces/invoice';
import { getInvoicePdf } from '@services/invoice-service';
import { Button, Icon, Link, useSnackbar, useThemeQueries } from '@sk-web-gui/react';
import { ArrowDownToLine } from 'lucide-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePdfDownload } from '@utils/use-pdf-download.hook';

interface DownloadPdfButtonProps {
  isLoading?: { [key: string]: boolean };
  setIsLoading?: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  item: IInvoice;
}

export const DownloadPdfButton: React.FC<DownloadPdfButtonProps> = ({ isLoading, setIsLoading, item }) => {
  const message = useSnackbar();
  const { isMinDesktop } = useThemeQueries();
  const { t } = useTranslation('invoice');

  const showErrorMessage = useCallback(() => {
    message({
      message: t('invoice:pdf.error'),
      status: 'error',
    });
  }, [message, t]);

  const { downloadPdf, fallbackUrl, handleFallbackClick } = usePdfDownload({
    onError: () => {
      showErrorMessage();
    },
  });

  const updateIsLoadingForInvoice = useCallback(
    (invoiceNumber: string, value: boolean) => {
      if (!setIsLoading) return;
      setIsLoading((old) => ({
        ...old,
        [invoiceNumber]: value,
      }));
    },
    [setIsLoading]
  );

  const handleButtonClick = useCallback(async () => {
    if (!item.invoiceNumber || !item.organizationNumber) {
      showErrorMessage();
      return;
    }

    updateIsLoadingForInvoice(item.invoiceNumber, true);

    try {
      const invoiceData = await getInvoicePdf(item.organizationNumber, item.invoiceNumber);

      if (invoiceData.error !== undefined) {
        throw new Error();
      }

      downloadPdf(invoiceData.data, item.invoiceNumber);
    } catch {
      showErrorMessage();
    } finally {
      updateIsLoadingForInvoice(item.invoiceNumber, false);
    }
  }, [item, updateIsLoadingForInvoice, showErrorMessage, downloadPdf]);

  const invoiceKey = item.invoiceNumber;

  return (
    <div className="flex flex-col gap-2">
      <Button
        aria-label={t('invoice:pdf.fetchInvoice', { invoice: item.invoiceDescription })}
        size={isMinDesktop ? 'sm' : 'lg'}
        variant="secondary"
        loading={!!invoiceKey && isLoading?.[invoiceKey]}
        loadingText={t('invoice:pdf.fetching')}
        onClick={handleButtonClick}
        rightIcon={<Icon icon={<ArrowDownToLine />} />}
      >
        {t('invoice:pdf.fetch')}
      </Button>
      {fallbackUrl && (
        <Link
          href={fallbackUrl}
          target="_blank"
          variant="tertiary"
          rel="noopener noreferrer"
          size={isMinDesktop ? 'sm' : 'lg'}
          className="p-5"
          onClick={handleFallbackClick}
        >
          {t('invoice:pdf.openInBrowser')}
        </Link>
      )}
    </div>
  );
};
