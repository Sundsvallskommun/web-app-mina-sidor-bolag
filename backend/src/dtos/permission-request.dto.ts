import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class PermissionHeaderDto {
  @IsString()
  ExternalId: string;

  @IsString()
  Operation: 'grant' | 'deny' | 'revoke';
}

export class PermissionRequestDto {
  @IsString()
  EligablePartyId: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  ContractIdList?: number[];

  @IsOptional()
  @IsNumber()
  CustomerId?: number;
}

export class FullPermissionDto {
  Header: PermissionHeaderDto;
  PermissionRequest: PermissionRequestDto;
}
