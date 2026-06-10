import {
  MetaData as IMetaData,
  PdfInvoice as IPdfInvoice,
  InvoiceDetail as IInvoiceDetail,
  InvoiceDetailsResponse as IInvoiceDetailsResponse,
  CustomerInvoice as ICustomerInvoice,
  CustomerInvoicesResponse as ICustomerInvoicesResponse,
} from '@/data-contracts/invoices/data-contracts';
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

export enum InvoiceInvoiceStatusEnum {
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

export enum InvoiceInvoiceTypeEnum {
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

export enum InvoiceInvoiceOriginEnum {
  COMMERCIAL = 'COMMERCIAL',
  PUBLIC_ADMINISTRATION = 'PUBLIC_ADMINISTRATION',
}

export enum CustomerInvoiceCustomerTypeEnum {
  ENTERPRISE = 'ENTERPRISE',
  PRIVATE = 'PRIVATE',
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

export enum GetInvoicesParamsInvoiceTypeEnum {
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

export enum GetInvoicesParamsInvoiceStatusEnum {
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

export enum GetInvoicesParamsInvoiceOriginEnum {
  COMMERCIAL = 'COMMERCIAL',
  PUBLIC_ADMINISTRATION = 'PUBLIC_ADMINISTRATION',
}

export enum GetInvoicesParamsEnum {
  COMMERCIAL = 'COMMERCIAL',
  PUBLIC_ADMINISTRATION = 'PUBLIC_ADMINISTRATION',
}

export enum GetPdfInvoiceParamsInvoiceTypeEnum {
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

export enum GetPdfInvoiceParamsInvoiceOriginEnum {
  COMMERCIAL = 'COMMERCIAL',
  PUBLIC_ADMINISTRATION = 'PUBLIC_ADMINISTRATION',
}

export enum GetPdfInvoiceParamsEnum {
  COMMERCIAL = 'COMMERCIAL',
  PUBLIC_ADMINISTRATION = 'PUBLIC_ADMINISTRATION',
}

export enum DownloadInvoicePdfParamsInvoiceTypeEnum {
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

export enum DownloadInvoicePdfParamsInvoiceOriginEnum {
  COMMERCIAL = 'COMMERCIAL',
  PUBLIC_ADMINISTRATION = 'PUBLIC_ADMINISTRATION',
}

export enum DownloadInvoicePdfParamsEnum {
  COMMERCIAL = 'COMMERCIAL',
  PUBLIC_ADMINISTRATION = 'PUBLIC_ADMINISTRATION',
}

export enum GetInvoicesForCustomerParamsStatusEnum {
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

export enum Direction {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class MetaData implements IMetaData {
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
}

export class PdfInvoice implements IPdfInvoice {
  @IsOptional()
  @IsString()
  fileName?: string;
  @IsOptional()
  @IsString()
  file?: string;
}

export class InvoiceDetail implements IInvoiceDetail {
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
  @IsString()
  description?: string;
  @IsOptional()
  @IsString()
  productCode?: string;
  @IsOptional()
  @IsString()
  productName?: string;
  @IsOptional()
  @IsString()
  fromDate?: string;
  @IsOptional()
  @IsString()
  toDate?: string;
  @IsOptional()
  @IsString()
  facilityId?: string;
  @IsOptional()
  @IsString()
  administration?: string;
}

export class InvoiceDetailsResponse implements IInvoiceDetailsResponse {
  @ValidateNested({ each: true })
  @Type(() => InvoiceDetail)
  details?: InvoiceDetail[];
}

export class CustomerInvoice implements ICustomerInvoice {
  @IsOptional()
  @IsString()
  customerNumber?: string;
  @IsOptional()
  @IsEnum(CustomerInvoiceCustomerTypeEnum)
  customerType?: CustomerInvoiceCustomerTypeEnum;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facilityIds?: string[];
  @IsOptional()
  @IsString()
  invoiceNumber?: string;
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
  @IsString()
  ocrNumber?: string;
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
  @ValidateNested({ each: true })
  @Type(() => InvoiceDetail)
  details?: InvoiceDetail[];
}

export class CustomerInvoicesResponse implements ICustomerInvoicesResponse {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CustomerInvoice)
  invoices?: CustomerInvoice[];
  @IsOptional()
  @ValidateNested()
  @Type(() => MetaData)
  _meta?: MetaData;
}
