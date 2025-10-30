import { GranteeDetails, GrantorDetails, MandateDetails, PagingAndSortingMetaData } from '@/data-contracts/myrepresentatives/data-contracts';
import { SignCollectResponse, SignStatus } from '@/interfaces/bankid.interface';
import { MandateStatus } from '@/interfaces/mandates.interface';
import { ApiResponse } from '@/services/api.service';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CompletionData } from './bankid.response';
import { Meta } from './common.response';

export class Grantor implements GrantorDetails {
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  grantorPartyId: string;
  @IsString()
  signatoryPartyId: string;
}

export class Grantee implements GranteeDetails {
  @IsString()
  partyId: string;
}

export class SigningInfo implements SignCollectResponse {
  @IsString()
  orderRef: string;
  @IsEnum(SignStatus)
  status: SignStatus;
  @ValidateNested()
  @Type(() => CompletionData)
  completionData;
}

export class Mandate implements MandateDetails {
  @IsString()
  id: string;
  @ValidateNested()
  @Type(() => Grantor)
  @IsOptional()
  grantorDetails?: GrantorDetails;
  @ValidateNested()
  @Type(() => Grantee)
  @IsOptional()
  granteeDetails?: GranteeDetails;
  @IsString()
  @IsOptional()
  municipalityId?: string;
  @IsString()
  @IsOptional()
  namespace?: string;
  @IsDateString()
  created?: string;
  @IsDateString()
  updated?: string;
  @IsDateString()
  activeFrom?: string;
  @IsDateString()
  @IsOptional()
  inactiveAfter?: string;
  @IsEnum(MandateStatus)
  status?: string;
  @ValidateNested()
  @Type(() => SigningInfo)
  signingInfo?: SigningInfo;
}

export class MandatesApiResponse extends Meta implements ApiResponse<MandateDetails[]>, PagingAndSortingMetaData {
  @ValidateNested({ each: true })
  data: MandateDetails[];
  @IsString()
  message: string;
}
export class MandateApiResponse extends Meta implements ApiResponse<MandateDetails> {
  @ValidateNested()
  data: MandateDetails;
  @IsString()
  message: string;
}
