import { Type } from 'class-transformer';
import { IsString, ValidateNested, IsOptional } from 'class-validator';
import { ApiResponse } from '@/interfaces/service';
import { PersonEngagement } from '@/data-contracts/legalentity/data-contracts';
import { BusinessInformation } from '@/data-contracts/businessengagements/data-contracts';

/**
 * =========
 *  BUSINESS ENGAGEMENT LIST RESPONSE
 * =========
 */

export class PersonEngagementResponse implements PersonEngagement {
  @IsString()
  organizationNumber: string;

  @IsString()
  name: string;

  @IsString()
  form: string;

  @IsString()
  formShort: string;

  @ValidateNested({ each: true })
  @Type(() => Role)
  roles: { description: string; code: string }[];

  isAuthorizedSignatory: boolean | null;
  isSoleTrader: boolean | null;
  source: string;
}

class Role {
  @IsString()
  description: string;

  @IsString()
  code: string;
}

export class BusinessEngagementsApiResponse implements ApiResponse<PersonEngagement[]> {
  @ValidateNested({ each: true })
  @Type(() => PersonEngagementResponse)
  data: PersonEngagement[];

  @IsString()
  message: string;
}

/**
 * =========
 *  BUSINESS INFORMATION RESPONSE
 * =========
 */

export class InformationResponse {
  @ValidateNested()
  @Type(() => CompanyLocationWrap)
  information: {
    companyLocation: BusinessInformation['companyLocation'];
  };
}

class CompanyLocationWrap {
  @IsOptional()
  address?: BusinessInformation['companyLocation'];
}

export class BusinessInformationApiResponse implements ApiResponse<InformationResponse> {
  @ValidateNested()
  @Type(() => InformationResponse)
  data: InformationResponse;

  @IsString()
  message: string;
}
