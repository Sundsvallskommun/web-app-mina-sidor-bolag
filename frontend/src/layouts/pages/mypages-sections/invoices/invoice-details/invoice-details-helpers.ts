import { InvoiceDetail } from '@data-contracts/backend/data-contracts';

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
