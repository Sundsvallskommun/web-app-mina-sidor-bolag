import { BFUSEligablePartyPart } from '@/interfaces/bfus.interface';
import { IsString, ValidateNested } from 'class-validator';

export class BFUSApiResponse {
  @IsString()
  message: string;
  @ValidateNested()
  data: { customerIds: number[] };
}

export class BFUSEligablePartyApiResponse {
  @IsString()
  message: string;
  @ValidateNested()
  data: { eligablePartyParts: BFUSEligablePartyPart[] };
}
