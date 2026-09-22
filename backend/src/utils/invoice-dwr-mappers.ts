import {
  CustomerInvoice as DwrCustomerInvoice,
  CustomerInvoiceResponse as DwrCustomerInvoicesResponse,
} from '@/data-contracts/datawarehousereader/data-contracts';
import {
  CustomerInvoice,
  CustomerInvoiceInvoiceStatusEnum,
  CustomerInvoiceInvoiceTypeEnum,
} from '@/responses/datawarehousereader.response';

export type { DwrCustomerInvoice, DwrCustomerInvoicesResponse };

const invoiceStatusToDwr: Partial<Record<CustomerInvoiceInvoiceStatusEnum, string>> = {
  [CustomerInvoiceInvoiceStatusEnum.PAID]: 'Betalad',
  [CustomerInvoiceInvoiceStatusEnum.CREDITED]: 'Krediterad',
  [CustomerInvoiceInvoiceStatusEnum.DEBT_COLLECTION]: 'Inkasso',
  [CustomerInvoiceInvoiceStatusEnum.WRITTEN_OFF]: 'Avskriven',
  [CustomerInvoiceInvoiceStatusEnum.SENT]: 'Skickad',
  [CustomerInvoiceInvoiceStatusEnum.REMINDER]: 'Påminnelse',
  [CustomerInvoiceInvoiceStatusEnum.VOID]: 'Makulerad',
  [CustomerInvoiceInvoiceStatusEnum.PAID_TOO_MUCH]: 'Överbetald',
  [CustomerInvoiceInvoiceStatusEnum.UNKNOWN]: 'Okänd',
};

const invoiceTypeToDwr: Partial<Record<CustomerInvoiceInvoiceTypeEnum, string>> = {
  [CustomerInvoiceInvoiceTypeEnum.INVOICE]: 'Faktura',
  [CustomerInvoiceInvoiceTypeEnum.CREDIT_INVOICE]: 'Kreditfaktura',
  [CustomerInvoiceInvoiceTypeEnum.START_INVOICE]: 'Startfaktura',
  [CustomerInvoiceInvoiceTypeEnum.FINAL_INVOICE]: 'Slutfaktura',
  [CustomerInvoiceInvoiceTypeEnum.OFFSET_INVOICE]: 'Kvittning',
  [CustomerInvoiceInvoiceTypeEnum.INTERNAL_INVOICE]: 'Internfaktura',
  [CustomerInvoiceInvoiceTypeEnum.CONSOLIDATED_INVOICE]: 'Samlingsfaktura',
};

const invert = <E extends string>(map: Partial<Record<E, string>>): Record<string, E> =>
  Object.fromEntries(Object.entries(map).map(([key, value]) => [(value as string).toLowerCase(), key as E]));

const invoiceStatusFromDwr = invert(invoiceStatusToDwr);
const invoiceTypeFromDwr = invert(invoiceTypeToDwr);

const normalize = (value?: string | null): string => value?.trim().toLowerCase() ?? '';

export const toDwrInvoiceStatus = (status?: CustomerInvoiceInvoiceStatusEnum): string | undefined =>
  status ? invoiceStatusToDwr[status] : undefined;

export const fromDwrInvoiceStatus = (value?: string | null): CustomerInvoiceInvoiceStatusEnum =>
  invoiceStatusFromDwr[normalize(value)] ?? CustomerInvoiceInvoiceStatusEnum.UNKNOWN;

export const fromDwrInvoiceType = (value?: string | null): CustomerInvoiceInvoiceTypeEnum =>
  invoiceTypeFromDwr[normalize(value)] ?? CustomerInvoiceInvoiceTypeEnum.UNKNOWN;

export const fromDwrInvoice = (invoice: DwrCustomerInvoice): CustomerInvoice => ({
  ...invoice,
  invoiceStatus: fromDwrInvoiceStatus(invoice.invoiceStatus),
  invoiceType: fromDwrInvoiceType(invoice.invoiceType),
});
