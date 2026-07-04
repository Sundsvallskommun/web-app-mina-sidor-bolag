import { IsString, IsOptional, IsArray, IsNumber, IsIn } from 'class-validator';

export class ConsentHeaderDto {
  @IsString()
  ExternalId: string;
  @IsString()
  @IsIn(['grant', 'deny', 'revoke'])
  Operation: 'grant' | 'deny' | 'revoke';
}

export class ConsentRequestDto {
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

export class FullConsentDto {
  Header: ConsentHeaderDto;
  PermissionRequest: ConsentRequestDto;
}
