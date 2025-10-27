import { QrCode, SignCollectResponse, SignResponse, SignStatus } from '@/interfaces/bankid.interface';
import { ApiResponse } from '@/services/api.service';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

export class Sign implements Pick<SignResponse, 'orderRef' | 'autoStartToken'>, QrCode {
  @IsString()
  orderRef: string;
  @IsString()
  autoStartToken: string;
  @IsString()
  @IsOptional()
  qrCode?: string;
}

export class SignCollect implements SignCollectResponse, QrCode {
  @IsString()
  orderRef: string;
  @IsEnum(SignStatus)
  status: SignStatus;
  @IsString()
  hintCode?: string;
  @IsString()
  @IsOptional()
  qrCode?: string;
}

export class SignApiResponse implements ApiResponse<Sign> {
  @ValidateNested()
  @Type(() => Sign)
  data: Sign;
  @IsString()
  message: string;
}
export class SignCollectApiResponse implements ApiResponse<SignCollect> {
  @ValidateNested()
  @Type(() => SignCollect)
  data: SignCollect;
  @IsString()
  message: string;
}
