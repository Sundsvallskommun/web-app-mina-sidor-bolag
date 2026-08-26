import { InvoiceDetail } from '@data-contracts/backend/data-contracts';
import { GroupedDetails } from '@interfaces/invoice';
import { User } from '@interfaces/user';

export const formatQuantity = (item: InvoiceDetail): string => {
  if (item.quantity == null) return '';
  switch (item.unit) {
    case 'kWh':
    case 'MWh':
      return `${item.quantity.toFixed(2)} ${item.unit}`;
    case 'MON':
    case 'Y':
      return '1 månad';
    default:
      return String(item.quantity);
  }
};

export const formatUnitPrice = (item: InvoiceDetail): string => {
  if (item.unitPrice == null) return '';
  switch (item.unit) {
    case 'kWh':
      return `${item.unitPrice} öre/kWh`;
    case 'MWh':
      return `${item.unitPrice} kr/MWh`;
    case 'MON':
      return `${item.unitPrice} kr/månad`;
    case 'Y':
      return `${item.unitPrice} kr/år`;
    default:
      return `${item.unitPrice} kr`;
  }
};

export const kr = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' });

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
