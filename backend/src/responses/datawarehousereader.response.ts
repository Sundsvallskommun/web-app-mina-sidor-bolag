import {
  CustomerInvoice as ICustomerInvoice,
  CustomerInvoiceResponse as ICustomerInvoiceResponse,
  CustomerType,
  Direction,
  InvoiceDetail as IInvoiceDetail,
  PagingAndSortingMetaData as IPagingAndSortingMetaData,
} from '@/data-contracts/datawarehousereader/data-contracts';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum CustomerInvoiceInvoiceStatusEnum {
  PAID = 'PAID',
  SENT = 'SENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  DEBT_COLLECTION = 'DEBT_COLLECTION',
  PAID_TOO_MUCH = 'PAID_TOO_MUCH',
  REMINDER = 'REMINDER',
  VOID = 'VOID',
  CREDITED = 'CREDITED',
  WRITTEN_OFF = 'WRITTEN_OFF',
  UNKNOWN = 'UNKNOWN',
}

export enum CustomerInvoiceInvoiceTypeEnum {
  INVOICE = 'INVOICE',
  CREDIT_INVOICE = 'CREDIT_INVOICE',
  START_INVOICE = 'START_INVOICE',
  FINAL_INVOICE = 'FINAL_INVOICE',
  DIRECT_DEBIT = 'DIRECT_DEBIT',
  SELF_INVOICE = 'SELF_INVOICE',
  REMINDER = 'REMINDER',
  CONSOLIDATED_INVOICE = 'CONSOLIDATED_INVOICE',
  INTERNAL_INVOICE = 'INTERNAL_INVOICE',
  OFFSET_INVOICE = 'OFFSET_INVOICE',
  UNKNOWN = 'UNKNOWN',
}

export class MetaData implements IPagingAndSortingMetaData {
  @IsOptional()
  @IsNumber()
  page?: number;
  @IsOptional()
  @IsNumber()
  limit?: number;
  @IsOptional()
  @IsNumber()
  count?: number;
  @IsOptional()
  @IsNumber()
  totalRecords?: number;
  @IsOptional()
  @IsNumber()
  totalPages?: number;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sortBy?: string[];
  @IsOptional()
  @IsEnum(Direction)
  sortDirection?: Direction;
}

export class InvoiceDetail implements IInvoiceDetail {
  @IsOptional()
  @IsNumber()
  invoiceNumber?: number;
  @IsOptional()
  @IsNumber()
  amount?: number;
  @IsOptional()
  @IsNumber()
  amountVatExcluded?: number;
  @IsOptional()
  @IsNumber()
  vat?: number;
  @IsOptional()
  @IsNumber()
  vatRate?: number;
  @IsOptional()
  @IsNumber()
  quantity?: number;
  @IsOptional()
  @IsString()
  unit?: string;
  @IsOptional()
  @IsNumber()
  unitPrice?: number;
  @IsOptional()
  @IsNumber()
  unitPriceVatExcluded?: number;
  @IsOptional()
  @IsNumber()
  invoiceUnitPrice?: number;
  @IsOptional()
  @IsNumber()
  invoiceUnitPriceVatExcluded?: number;
  @IsOptional()
  @IsString()
  invoiceUnitPriceCurrency?: string;
  @IsOptional()
  @IsString()
  invoiceUnitPriceUnit?: string;
  @IsOptional()
  @IsString()
  periodFrom?: string;
  @IsOptional()
  @IsString()
  periodTo?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsNumber()
  productCode?: number;
  @IsOptional()
  @IsString()
  productName?: string;
  @IsOptional()
  @IsString()
  organizationNumber?: string;
  @IsOptional()
  @IsString()
  administration?: string;
  @IsOptional()
  @IsString()
  facilityId?: string;
}

export class CustomerInvoice implements Omit<ICustomerInvoice, 'invoiceType' | 'invoiceStatus'> {
  @IsOptional()
  @IsString()
  customerNumber?: string;
  @IsOptional()
  @IsEnum(CustomerType)
  customerType?: CustomerType;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facilityIds?: string[];
  @IsOptional()
  @IsNumber()
  invoiceNumber?: number;
  @IsOptional()
  @IsNumber()
  invoiceId?: number;
  @IsOptional()
  @IsNumber()
  jointInvoiceId?: number;
  @IsOptional()
  @IsString()
  invoiceDate?: string;
  @IsOptional()
  @IsString()
  invoiceName?: string;
  @IsOptional()
  @IsEnum(CustomerInvoiceInvoiceTypeEnum)
  invoiceType?: CustomerInvoiceInvoiceTypeEnum;
  @IsOptional()
  @IsString()
  invoiceDescription?: string;
  @IsOptional()
  @IsEnum(CustomerInvoiceInvoiceStatusEnum)
  invoiceStatus?: CustomerInvoiceInvoiceStatusEnum;
  @IsOptional()
  @IsNumber()
  ocrNumber?: number;
  @IsOptional()
  @IsString()
  dueDate?: string;
  @IsOptional()
  @IsString()
  periodFrom?: string;
  @IsOptional()
  @IsString()
  periodTo?: string;
  @IsOptional()
  @IsNumber()
  totalAmount?: number;
  @IsOptional()
  @IsNumber()
  amountVatIncluded?: number;
  @IsOptional()
  @IsNumber()
  amountVatExcluded?: number;
  @IsOptional()
  @IsNumber()
  vatEligibleAmount?: number;
  @IsOptional()
  @IsNumber()
  rounding?: number;
  @IsOptional()
  @IsString()
  organizationGroup?: string;
  @IsOptional()
  @IsString()
  organizationNumber?: string;
  @IsOptional()
  @IsString()
  administration?: string;
  @IsOptional()
  @IsString()
  street?: string;
  @IsOptional()
  @IsString()
  postCode?: string;
  @IsOptional()
  @IsString()
  city?: string;
  @IsOptional()
  @IsString()
  careOf?: string;
  @IsOptional()
  @IsString()
  invoiceReference?: string;
  @IsOptional()
  @IsBoolean()
  pdfAvailable?: boolean;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => InvoiceDetail)
  details?: InvoiceDetail[];
}

export class CustomerInvoicesResponse implements Omit<ICustomerInvoiceResponse, 'invoices'> {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CustomerInvoice)
  invoices?: CustomerInvoice[];
  @IsOptional()
  @ValidateNested()
  @Type(() => MetaData)
  _meta?: MetaData;
}
