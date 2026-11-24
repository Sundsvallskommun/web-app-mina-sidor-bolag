import 'reflect-metadata';
import dayjs from 'dayjs';

jest.mock('@config', () => ({ MUNICIPALITY_ID: '2281' }));
jest.mock('@/config/api-config', () => ({ getApiBase: (key: string) => key }));
jest.mock('@/services/api.service', () => ({ __esModule: true, default: class MockApiService {} }));

import { INVOICE_YEARS_BACK, getInvoicePeriodFrom, getInvoiceYearPeriod } from '@/services/invoices.service';

describe('getInvoiceYearPeriod', () => {
  const currentYear = dayjs().year();

  it('opens the window on 31 December the year before, so January invoices are included', () => {
    expect(getInvoiceYearPeriod(currentYear - 1)).toEqual({
      periodFrom: `${currentYear - 2}-12-31`,
      periodTo: `${currentYear - 1}-12-31`,
    });
  });

  it('starts the earliest year where the list window starts', () => {
    expect(getInvoiceYearPeriod(currentYear - INVOICE_YEARS_BACK)?.periodFrom).toBe(getInvoicePeriodFrom());
  });

  it('rejects years outside the window and non-years', () => {
    expect(getInvoiceYearPeriod(currentYear + 1)).toBeUndefined();
    expect(getInvoiceYearPeriod(currentYear - INVOICE_YEARS_BACK - 1)).toBeUndefined();
    expect(getInvoiceYearPeriod(NaN)).toBeUndefined();
    expect(getInvoiceYearPeriod(2025.5)).toBeUndefined();
  });
});
