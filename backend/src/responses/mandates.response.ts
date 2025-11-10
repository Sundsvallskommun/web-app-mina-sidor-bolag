import { GranteeDetails, GrantorDetails, MandateDetails, PagingAndSortingMetaData } from '@/data-contracts/myrepresentatives/data-contracts';
import { SignCollectResponse, SignStatus } from '@/interfaces/bankid.interface';
import { MandatePopulated as MandatePopulatedType, MandateStatus, MandateUser } from '@/interfaces/mandates.interface';
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

export class MandatePart implements MandateUser {
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  personNumber?: string;
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

class MandateDefaults implements Pick<MandateDetails, 'id' | 'created' | 'updated' | 'activeFrom' | 'inactiveAfter' | 'status'> {
  @IsString()
  id: string;
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
}

export class Mandate extends MandateDefaults implements MandateDetails {
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
  @ValidateNested()
  @Type(() => SigningInfo)
  signingInfo?: SigningInfo;
}

export class MandatePopulated extends MandateDefaults implements MandatePopulatedType {
  @ValidateNested()
  @Type(() => MandatePart)
  grantee: MandateUser;
  @ValidateNested()
  @Type(() => MandatePart)
  grantor: MandateUser;
}

export class MandatesApiResponse extends Meta implements ApiResponse<MandateDetails[]>, PagingAndSortingMetaData {
  @ValidateNested({ each: true })
  @Type(() => Mandate)
  data: MandateDetails[];
  @IsString()
  message: string;
}
export class MandateApiResponse extends Meta implements ApiResponse<MandateDetails> {
  @ValidateNested()
  @Type(() => Mandate)
  data: MandateDetails;
  @IsString()
  message: string;
}

export class PopulatedMandatesApiResponse extends Meta implements ApiResponse<MandatePopulatedType[]>, PagingAndSortingMetaData {
  @ValidateNested({ each: true })
  @Type(() => MandatePopulated)
  data: MandatePopulatedType[];
  @IsString()
  message: string;
}
