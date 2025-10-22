import {
  QrCode,
  SignCollectResponse,
  SignCompletionData,
  SignCompletionDataDevice,
  SignCompletionDataStepUp,
  SignCompletionDataUser,
  SignResponse,
  SignRisk,
  SignStatus,
} from '@/interfaces/bankid.interface';
import { ApiResponse } from '@/services/api.service';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

export class Sign implements Pick<SignResponse, 'orderRef' | 'autoStartToken'>, QrCode {
  @IsString()
  orderRef: string;
  @IsString()
  autoStartToken: string;
  @IsString()
  @IsOptional()
  qrCode?: string;
}

class User implements SignCompletionDataUser {
  @IsString()
  personalNumber: string;
  @IsString()
  name: string;
  @IsString()
  givenName: string;
  @IsString()
  surname: string;
}

class StepUp implements SignCompletionDataStepUp {
  @IsBoolean()
  mrtd: boolean;
}

class Device implements SignCompletionDataDevice {
  @IsString()
  ipAddress: string;
  @IsString()
  uhi: string;
}
export class CompletionData implements SignCompletionData {
  @ValidateNested()
  @Type(() => User)
  user: User;
  @ValidateNested()
  @Type(() => Device)
  device: Device;
  @ValidateNested()
  @Type(() => StepUp)
  stepUp: StepUp;
  @IsDateString()
  bankIdIssueDate: string;
  @IsString()
  signature: string;
  @IsString()
  ocspResponse: string;
  @IsEnum(SignRisk)
  @IsOptional()
  risk: SignRisk;
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
