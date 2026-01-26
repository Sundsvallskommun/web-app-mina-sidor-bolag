import { IInvoice } from '@interfaces/invoice';
import { Button, Card, Divider, Icon, Label } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';
import { DownloadPdfButton } from './get-pdf-button.component';
import { useTranslation } from 'react-i18next';

export const InvoicesCardEntry: React.FC<{ organizationName: string; item: IInvoice }> = ({
  organizationName,
  item,
}) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('invoice');

  return (
    <Card>
      <Card.Body className="w-full p-md">
        <div className="flex flex-col gap-md">
          <div>
            <div className="flex flex-row">
              <h3 className="font-bold text-label-large line-height-[2.6rem]">{organizationName}</h3>
              <Label
                rounded
                inverted={item.invoiceStatus?.color !== 'neutral'}
                color={item.invoiceStatus?.color}
                className="ml-auto"
              >
                {item?.invoiceStatus?.label}
              </Label>
            </div>
            <span className="text-base">{item.invoiceDescription}</span>
          </div>

          <div className="flex flex-col gap-[1.2rem]">
            <div>
              <span>{t('invoice:card.amount', { amount: item.totalAmount })}</span>
            </div>
            <div>
              <span>{t('invoice:card.dueDate', { date: dayjs(item.dueDate).format('YYYY-MM-DD') })}</span>
            </div>
            {open ? (
              <>
                <div>
                  <span>{t('invoice:card.date', { date: dayjs(item.invoiceDate).format('YYYY-MM-DD') })} </span>
                </div>
                <div>
                  <span>{t('invoice:card.ocr', { number: item.ocrNumber })}</span>
                </div>
              </>
            ) : undefined}
          </div>

          {open ? (
            <div className="flex flex-col mb-sm">
              <DownloadPdfButton item={item} />
            </div>
          ) : undefined}

          <Divider />

          <Button
            className="w-full border-0 hover:bg-transparent"
            aria-label={open ? t('invoice:card.ariaClose') : t('invoice:card.ariaOpen')}
            showBackground={false}
            variant="secondary"
            size="md"
            rounded
            onClick={() => setOpen((open) => !open)}
          >
            {open ? t('invoice:card.showLess') : t('invoice:card.showMore')}
            <Icon icon={open ? <ChevronUp /> : <ChevronDown />} />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};
