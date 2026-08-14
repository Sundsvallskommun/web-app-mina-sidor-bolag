import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { ConsentRequestDto } from './consent-request.dto';

export class UpdateConsentDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => ConsentRequestDto)
  PermissionRequest: ConsentRequestDto;
}
