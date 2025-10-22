import { SignBody, SignWeb as SignWebType, UserVisibleDataFormat } from '@/interfaces/bankid.interface';
import { Type } from 'class-transformer';
import { IsEnum, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { SignMandateDetails } from './mandate.dto';

export class SignWeb implements SignWebType {
  @IsString()
  @IsOptional()
  deviceIdentifier: string;
  @IsString()
  @IsOptional()
  referringDomain: string;
  @IsString()
  @IsOptional()
  userAgent: string;
}

export class SignDto implements Omit<SignBody, 'endUserIp'> {
  @IsString()
  userVisibleData: string;
  @IsEnum(UserVisibleDataFormat)
  userVisibleDataFormat?: UserVisibleDataFormat;
  @ValidateNested()
  @Type(() => SignWeb)
  @IsOptional()
  web?: SignWebType;
  @IsObject()
  @IsOptional()
  details?: Record<string, unknown>;
}
export class SignMandateDto implements Omit<SignBody, 'endUserIp'> {
  @IsString()
  userVisibleData: string;
  @IsEnum(UserVisibleDataFormat)
  userVisibleDataFormat?: UserVisibleDataFormat;
  @ValidateNested()
  @Type(() => SignWeb)
  @IsOptional()
  web?: SignWebType;
  @ValidateNested()
  @Type(() => SignMandateDetails)
  mandate?: SignMandateDetails;
}
