import { ArrayNotEmpty, IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class PermissionRequestDto {
  @IsString()
  EligablePartyId: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  ContractIdList?: number[];

  @IsOptional()
  @IsNumber()
  CustomerId?: number;
}
