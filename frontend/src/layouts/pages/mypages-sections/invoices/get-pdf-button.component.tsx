import { IInvoice } from '@interfaces/invoice';
import { getInvoicePdf } from '@services/invoice-service';
import { Button, cx, Icon, useSnackbar, useThemeQueries } from '@sk-web-gui/react';
import { ArrowDownToLine } from 'lucide-react';
import { useCallback } from 'react';
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
      if (setIsLoading) {
        setIsLoading((old) => {
          const newObj = { ...old };
          newObj[invoiceNumber] = value;
          return newObj;
        });
      }
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
      const invoicePdfData = await getInvoicePdf(item.organizationNumber, item.invoiceNumber);

      if (invoicePdfData.error !== undefined) {
        throw new Error();
      }

      const fileName = item.invoiceName ?? invoicePdfData.pdf.fileName;
      downloadPdf(invoicePdfData.pdf.file, fileName);
    } catch {
      showErrorMessage();
    } finally {
      updateIsLoadingForInvoice(item.invoiceNumber, false);
    }
  }, [item, updateIsLoadingForInvoice, showErrorMessage, downloadPdf]);
  return (
    <div className="flex flex-col gap-2">
      <Button
        aria-label={t('invoice:pdf.fetchInvoice', { invoice: item.invoiceDescription })}
        size={isMinDesktop ? 'sm' : 'lg'}
        variant="secondary"
        loading={isLoading?.[item.invoiceNumber ?? '']}
        loadingText={t('invoice:pdf.fetching')}
        onClick={handleButtonClick}
        rightIcon={<Icon icon={<ArrowDownToLine />} />}
      >
        {t('invoice:pdf.fetch')}
      </Button>
      {fallbackUrl && (
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cx(isMinDesktop ? 'text-label-small' : 'text-label-medium', 'p-5 text-blue-600 hover:underline')}
          onClick={handleFallbackClick}
        >
          {t('invoice:pdf.openInBrowser')}
        </a>
      )}
    </div>
  );
};
