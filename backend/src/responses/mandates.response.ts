import {
  CompletionData as CompletionDataType,
  Device,
  GranteeDetails,
  GrantorDetails,
  MandateDetails,
  PagingAndSortingMetaData,
  User,
} from '@/data-contracts/myrepresentatives/data-contracts';
import { GrpStatus } from '@/interfaces/grp.interface';
import { MandatePopulated as MandatePopulatedType, MandateStatus, MandateUser } from '@/interfaces/mandates.interface';
import { ApiResponse } from '@/services/api.service';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
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

class CompletionDataUser implements User {
  @IsString()
  personalNumber: string;
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  givenName: string;
  @IsString()
  surname: string;
}

class CompletionDataDevice implements Device {
  @IsString()
  ipAddress: string;
  @IsString()
  uhi: string;
}
class CompletionData implements CompletionDataType {
  @IsDateString()
  bankIdIssueDate: string;
  @IsString()
  signature: string;
  @IsString()
  ocspResponse: string;
  @IsString()
  @IsOptional()
  risk?: string;
  @ValidateNested()
  @Type(() => CompletionDataUser)
  user: User;
  @ValidateNested()
  @Type(() => CompletionDataDevice)
  device: Device;
}

export class SigningInfo {
  @IsString()
  orderRef: string;
  @IsEnum(GrpStatus)
  status: GrpStatus;
  @ValidateNested()
  @Type(() => CompletionData)
  completionData: CompletionDataType;
}

class MandateDefaults
  implements Pick<MandateDetails, 'id' | 'created' | 'updated' | 'activeFrom' | 'inactiveAfter' | 'status'>
{
  @IsString()
  id: string;
  @IsDateString()
  @IsOptional()
  created?: string;
  @IsDateString()
  @IsOptional()
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
export class MandateApiResponse implements ApiResponse<Mandate> {
  @ValidateNested()
  @Type(() => Mandate)
  data: Mandate;
  @IsString()
  message: string;
}

export class PopulatedMandatesApiResponse
  extends Meta
  implements ApiResponse<MandatePopulatedType[]>, PagingAndSortingMetaData
{
  @ValidateNested({ each: true })
  @Type(() => MandatePopulated)
  data: MandatePopulatedType[];
  @IsString()
  message: string;
}
