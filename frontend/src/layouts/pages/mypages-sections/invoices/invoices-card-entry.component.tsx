import { IInvoice } from '@interfaces/invoice';
import { Button, Card, Icon, Label } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { GetPdfButton } from './get-pdf-button.component';

export const InvoicesCardEntry: React.FC<{ organizationName: string; item: IInvoice }> = ({ organizationName, item }) => {
  const [open, setOpen] = useState(false);
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
              <span>Belopp: </span>
              <span>{`${item.totalAmount}`}</span>
            </div>
            <div>
              <span>Förfallodatum: </span>
              <span>{dayjs(item.dueDate).format('YYYY-MM-DD')}</span>
            </div>
            { open ? (
              <>
                <div>
                  <span>Fakturadatum: </span>
                  <span>{dayjs(item.invoiceDate).format('YYYY-MM-DD')}</span>
                </div>
                <div>
                  <span>Fakturanummer: </span>
                  <span>{`${item.ocrNumber}`}</span>
                </div>
              </>
            ): undefined }
          </div>
          
          { open ? (
            <div className="flex flex-col mb-sm">
              <GetPdfButton item={item} />
            </div>
          ): undefined }

          <div className="border-b-1 border-divider"></div>

          <Button
            className="w-full border-0 hover:bg-transparent"
            aria-label={`${open ? 'Stäng' : 'Öppna'} fakturakort`}
            showBackground={false}
            variant="secondary"
            size="md"
            rounded
            onClick={() => setOpen((open) => !open)}
          >
            {open ? 'Visa mindre' : 'Visa mer'}
            <Icon icon={open ? <ChevronUp /> : <ChevronDown />} />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};
