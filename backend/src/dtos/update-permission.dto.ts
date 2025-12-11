import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { PermissionRequestDto } from './permission-request.dto';

export class UpdatePermissionDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => PermissionRequestDto)
  PermissionRequest: PermissionRequestDto;
}
