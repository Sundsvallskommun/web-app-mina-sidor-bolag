import { BFUSConsent } from '@/interfaces/bfus.interface';
import { IsString, ValidateNested } from 'class-validator';

export class BFUSApiResponse {
  @IsString()
  message: string;
  @ValidateNested()
  data: { customerIds: number[] };
}

export class BFUSConsentsApiResponse {
  @IsString()
  message: string;
  @ValidateNested()
  data: { consents: BFUSConsent[] };
}

export class BFUSNewConsentApiResponse {
  @IsString()
  message: string;
  @ValidateNested()
  data: boolean;
}
