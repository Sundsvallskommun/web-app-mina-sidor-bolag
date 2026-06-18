import {
  LEAddress,
  LegalEntity2,
  PersonEngagement as PersonEngagementResponse,
} from '@/data-contracts/legalentity/data-contracts';
import { ApiResponse } from '@/interfaces/service';
import { IsNullable } from '@/utils/custom-validation-classes';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';

export class PersonEngagement implements PersonEngagementResponse {
  @IsString()
  @IsNullable()
  organizationNumber?: string | null;
  @IsString()
  @IsNullable()
  name?: string | null;
  @IsBoolean()
  @IsNullable()
  @IsOptional()
  isAuthorizedSignatory?: boolean | null;
  @IsBoolean()
  @IsNullable()
  @IsOptional()
  isSoleTrader?: boolean | null;
}

export class PersonEngagementsApiResponse implements ApiResponse<PersonEngagementResponse[]> {
  @ValidateNested({ each: true })
  @Type(() => PersonEngagement)
  data: PersonEngagement[];
  @IsString()
  message: string;
}

export class LegalEntityAddress implements LEAddress {
  @IsString()
  @IsNullable()
  addressArea?: string | null;
  @IsString()
  @IsNullable()
  adressNumber?: string | null;
  @IsString()
  @IsNullable()
  city?: string | null;
  @IsString()
  @IsNullable()
  postalCode?: string | null;
  @IsString()
  @IsNullable()
  municipality?: string | null;
  @IsString()
  @IsNullable()
  county?: string | null;
}

export class BusinessInformation implements Pick<LegalEntity2, 'address'> {
  @ValidateNested()
  @Type(() => LegalEntityAddress)
  address: LEAddress;
}

export class BusinessInformationApiResponse implements ApiResponse<Pick<LegalEntity2, 'address'>> {
  @ValidateNested()
  @Type(() => BusinessInformation)
  data: Pick<LegalEntity2, 'address'>;

  @IsString()
  message: string;
}
