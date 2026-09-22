import { Disclosure, Divider, Icon, Table, useThemeQueries } from '@sk-web-gui/react';
import { GroupedDetails } from '@interfaces/invoice';
import { InvoiceDetail } from '@data-contracts/backend/data-contracts';
import { useTranslation } from 'react-i18next';
import {
  formatQuantity,
  formatUnitPrice,
  kr,
} from '@layouts/pages/mypages-sections/invoices/invoice-details/invoice-details-helpers';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getRepresentingMode } from '@utils/representingModeRoute';
import { usePathname } from 'next/navigation';

export const InvoiceDetails = ({ groupedDetails }: { groupedDetails: GroupedDetails }) => {
  const { t } = useTranslation('invoice');
  const { isMinLargeDevice } = useThemeQueries();
  const pathname = usePathname();
  const isRepresentingBusiness = getRepresentingMode(pathname) === 1;
  const lineAmount = (item: InvoiceDetail) => (isRepresentingBusiness ? item.amountVatExcluded : item.amount) ?? 0;

  return Object.entries(groupedDetails).map(([facilityId, byDescription]) => {
    return isMinLargeDevice ? (
      <div
        key={facilityId}
        className="flex flex-col gap-y-40 bg-background-100 lg:p-24 p-20 mt-40 rounded-cards"
        data-cy="invoice-details"
      >
        {Object.entries(byDescription).map(([description, items]) => {
          const descriptionTotal = items.reduce((s, d) => s + lineAmount(d), 0);
          return (
            <div key={description}>
              <p className="text-large font-bold">{description}</p>
              <p>{t('invoice:facilityId', { facilityId: facilityId })}</p>

              <Table className="mt-24" data-cy="invoice-detail-table">
                <Table.Header>
                  <Table.HeaderColumn>{t('invoice:description')}</Table.HeaderColumn>
                  <Table.HeaderColumn>{t('invoice:period')}</Table.HeaderColumn>
                  <Table.HeaderColumn>{t('invoice:quantity')}</Table.HeaderColumn>
                  <Table.HeaderColumn>{t('invoice:cost')}</Table.HeaderColumn>
                  <Table.HeaderColumn>{t('invoice:inTotal')}</Table.HeaderColumn>
                </Table.Header>
                <Table.Body>
                  {items.map((item, i) => (
                    <Table.Row key={`${item.productCode}-${i}`}>
                      <Table.Column>{item.productName}</Table.Column>
                      <Table.Column>
                        {t('invoice:periodFromAndTo', { from: item.periodFrom, to: item.periodTo })}
                      </Table.Column>
                      <Table.Column>
                        {item.quantity} {item.unit}
                      </Table.Column>
                      <Table.Column>
                        {isRepresentingBusiness ? item.invoiceUnitPriceVatExcluded : item.invoiceUnitPrice}{' '}
                        {item.invoiceUnitPriceCurrency}/{item.invoiceUnitPriceUnit}
                      </Table.Column>
                      <Table.Column>{kr.format(lineAmount(item))}</Table.Column>
                    </Table.Row>
                  ))}
                  <Table.Row>
                    <Table.Column className="font-bold">{t('invoice:sum')}</Table.Column>
                    <Table.Column></Table.Column>
                    <Table.Column></Table.Column>
                    <Table.Column></Table.Column>
                    <Table.Column>{kr.format(descriptionTotal)}</Table.Column>
                  </Table.Row>
                </Table.Body>
              </Table>
            </div>
          );
        })}
      </div>
    ) : (
      <div key={facilityId} className="bg-background-100 pt-20 px-16 mt-20 rounded-cards" data-cy="invoice-details">
        {Object.entries(byDescription).map(([description, items]) => {
          const descriptionTotal = items.reduce((s, d) => s + lineAmount(d), 0);
          return (
            <div key={description}>
              <p className="text-large font-bold">{description}</p>
              <p className="mb-16">{t('invoice:facilityId', { facilityId: facilityId })}</p>
              <p className="font-bold">{t('invoice:sum')}</p>
              <p>{kr.format(descriptionTotal)}</p>
              <Disclosure>
                <Disclosure.Header>
                  <Disclosure.Title>
                    <p className="text-base font-bold">{t('invoice:showDetails')}</p>
                  </Disclosure.Title>
                  <Disclosure.Button>
                    {(open: boolean) => <Icon icon={open ? <ChevronUp /> : <ChevronDown />} />}
                  </Disclosure.Button>
                </Disclosure.Header>
                <Disclosure.Content className="mr-0 pb-16">
                  {items.map((item, i) => (
                    <div key={`${item.productCode}-${i}`}>
                      <Divider className="my-16" />
                      <p className="text-large font-bold">{item.productName}</p>
                      <p>{t('invoice:periodFromAndTo', { from: item.periodFrom, to: item.periodTo })}</p>
                      <div className="flex pt-8 justify-between">
                        <p className="font-bold">{t('invoice:quantity')}</p>
                        <p>{formatQuantity(item)}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="font-bold">{t('invoice:cost')}</p>
                        <p>{formatUnitPrice(item)}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="font-bold">{t('invoice:inTotal')}</p>
                        <p>{kr.format(lineAmount(item))}</p>
                      </div>
                    </div>
                  ))}
                </Disclosure.Content>
              </Disclosure>
            </div>
          );
        })}
      </div>
    );
  });
};
