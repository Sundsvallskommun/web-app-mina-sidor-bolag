import { IInvoice } from '@interfaces/invoice';
import { getInvoicePdf } from '@services/invoice-service';
import { Button, Icon, useSnackbar, useThemeQueries } from '@sk-web-gui/react';
import { ArrowDownToLine } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const GetPdfButton: React.FC<{
  isLoading?: { [key: string]: boolean };
  setIsLoading?: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  item: IInvoice;
}> = ({ isLoading, setIsLoading, item }) => {
  const message = useSnackbar();
  const { isMinDesktop } = useThemeQueries();
  const { t } = useTranslation('invoice');

  const getPdf = (organizationNumber: string, invoiceNumber: string) => {
    if (setIsLoading) {
      setIsLoading((old) => {
        const newObj = { ...old };
        newObj[invoiceNumber] = true;
        return newObj;
      });
    }
    getInvoicePdf(organizationNumber, invoiceNumber)
      .then((d) => {
        if (typeof d.error === 'undefined') {
          const uri = `data:application/pdf;base64,${d.pdf.file}`;
          const link = document.createElement('a');
          link.href = uri;
          link.setAttribute('download', `${invoiceNumber}.pdf`);
          document.body.appendChild(link);
          link.click();
        } else {
          message({
            message: t('invoice:pdf.error'),
            status: 'error',
          });
        }
      })
      .finally(() => {
        if (setIsLoading) {
          setIsLoading((old) => {
            const newObj = { ...old };
            newObj[invoiceNumber] = false;
            return newObj;
          });
        }
      });
  };

  return (
    <Button
      aria-label={t('invoice:pdf.fetchInvoice', { invoice: item.invoiceDescription })}
      size={isMinDesktop ? 'sm' : 'lg'}
      variant="secondary"
      loading={isLoading?.[item.invoiceNumber!]}
      loadingText={t('invoice:pdf.fetching')}
      onClick={() => getPdf(item.organizationNumber!, item.invoiceNumber!)}
      rightIcon={<Icon icon={<ArrowDownToLine />} />}
    >
      {t('invoice:pdf.fetch')}
    </Button>
  );
};
