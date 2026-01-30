import { IsIn, IsString } from 'class-validator';

export class PermissionHeaderDto {
  @IsString()
  ExternalId: string;

  @IsString()
  @IsIn(['grant', 'deny', 'revoke'])
  Operation: 'grant' | 'deny' | 'revoke';
}
