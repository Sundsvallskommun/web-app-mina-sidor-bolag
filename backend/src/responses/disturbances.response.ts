import {
  Affected as DisturbanceAffected,
  Disturbance as IDisturbance,
} from '@/data-contracts/disturbances/data-contracts';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiResponse } from '@services/api.service';

export enum Category {
  COMMUNICATION = 'COMMUNICATION',
  DISTRICT_COOLING = 'DISTRICT_COOLING',
  DISTRICT_HEATING = 'DISTRICT_HEATING',
  ELECTRICITY = 'ELECTRICITY',
  ELECTRICITY_TRADE = 'ELECTRICITY_TRADE',
  WASTE_MANAGEMENT = 'WASTE_MANAGEMENT',
  WATER = 'WATER',
}

export class Affected implements DisturbanceAffected {
  @IsString()
  partyId: string;
  @IsString()
  reference: string;
  @IsString()
  @IsOptional()
  facilityId?: string;
  @IsString()
  @IsOptional()
  coordinates?: string;
}

export enum Status {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  PLANNED = 'PLANNED',
}

export class Disturbance implements IDisturbance {
  @IsString()
  id: string;
  @IsString()
  @IsOptional()
  municipalityId?: string;
  @IsEnum(Category)
  category: Category;
  @IsEnum(Status)
  status: Status;
  @IsString()
  title: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  @IsOptional()
  plannedStartDate?: string;
  @IsString()
  @IsOptional()
  plannedStopDate?: string;
  @IsString()
  created: string;
  @IsString()
  @IsOptional()
  updated?: string;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Affected)
  affecteds?: Affected[];
}

export class DisturbanceApiResponse implements ApiResponse<Disturbance[]> {
  @ValidateNested({ each: true })
  @Type(() => Disturbance)
  data: Disturbance[];
  @IsString()
  message: string;
}
