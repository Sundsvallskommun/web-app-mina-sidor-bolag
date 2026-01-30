import { BFUSEligablePartyPart } from '@/interfaces/bfus.interface';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class BFUSApiResponse {
  @IsString()
  message: string;
  @IsNumber()
  @IsArray()
  customerIds: number[];
}

export class BFUSEligablePartyApiResponse {
  @IsString()
  message: string;
  @IsArray()
  eligablePartyParts: BFUSEligablePartyPart[];
}
