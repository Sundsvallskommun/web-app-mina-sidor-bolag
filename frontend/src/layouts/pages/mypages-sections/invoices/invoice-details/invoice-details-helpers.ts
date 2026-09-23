import { InvoiceDetail } from '@data-contracts/backend/data-contracts';
import { GroupedDetails } from '@interfaces/invoice';
import { User } from '@interfaces/user';

const LOCALE = 'sv-SE';

export const kr = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'SEK' });
const amountFormatter = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const unitPriceFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 4 });
const quantityFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2, useGrouping: false });
const energyQuantityFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

export const formatAmount = (value?: number | null): string => amountFormatter.format(value ?? 0);

export const formatQuantity = (item: InvoiceDetail): string => {
  if (item.quantity == null) return '';
  switch (item.unit) {
    case 'kWh':
    case 'MWh':
      return `${energyQuantityFormatter.format(item.quantity)} ${item.unit}`;
    case 'MON':
    case 'Y':
      return '1 månad';
    default:
      return [quantityFormatter.format(item.quantity), item.unit].filter(Boolean).join(' ');
  }
};

export const formatUnitPrice = (item: InvoiceDetail, vatExcluded = false): string => {
  const price = vatExcluded ? item.invoiceUnitPriceVatExcluded : item.invoiceUnitPrice;
  if (price == null) return '';
  const suffix = [item.invoiceUnitPriceCurrency, item.invoiceUnitPriceUnit].filter(Boolean).join('/');
  return [unitPriceFormatter.format(price), suffix].filter(Boolean).join(' ');
};

export const groupInvoiceDetails = (
  details: InvoiceDetail[],
  labels: { unknown: string; other: string }
): GroupedDetails => {
  const acc: GroupedDetails = {};
  for (const d of details) {
    const fac = d.facilityId ?? labels.unknown;
    const desc = d.description ?? labels.other;
    acc[fac] ??= {};
    acc[fac][desc] ??= [];
    acc[fac][desc].push(d);
  }
  return acc;
};

export const getInvoiceAddress = (user: User | undefined, facilityIds: string[]): string => {
  if (!user?.addresses?.length) return '';
  const wanted = new Set(facilityIds);
  const match = user.addresses.find((a) => a.facilityIds.some((id) => wanted.has(id)));
  return match?.address ?? '';
};
