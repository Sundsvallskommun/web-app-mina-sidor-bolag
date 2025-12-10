export class PermissionHeaderDto {
  ExternalId: string;
  Operation: 'grant' | 'deny' | 'revoke';
}

export class PermissionRequestDto {
  EligablePartyId: string;
  ContractIdList?: number[];
  CustomerId?: number;
}

export class FullPermissionDto {
  Header: PermissionHeaderDto;
  PermissionRequest: PermissionRequestDto;
}
