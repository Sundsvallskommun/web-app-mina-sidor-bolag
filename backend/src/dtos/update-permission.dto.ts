import { Type } from 'class-transformer';
import {
  IsDefined,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PermissionHeaderDto } from './permission-header.dto';
import { PermissionRequestDto } from './permission-request.dto';

@ValidatorConstraint({ name: 'PermissionRequestValidator', async: false })
export class PermissionRequestValidator implements ValidatorConstraintInterface {
  validate(request: PermissionRequestDto, args: ValidationArguments) {
    const op = (args.object as any).Header?.Operation;
    if (op === 'grant' || op === 'revoke') {
      return Array.isArray(request.ContractIdList) && request.ContractIdList.length > 0;
    } else if (op === 'deny') {
      return typeof request.CustomerId === 'number';
    }
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    const op = (args.object as any).Header?.Operation;
    return `PermissionRequest invalid for operation '${op}'`;
  }
}

export class UpdatePermissionDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => PermissionHeaderDto)
  Header: PermissionHeaderDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => PermissionRequestDto)
  @Validate(PermissionRequestValidator)
  PermissionRequest: PermissionRequestDto;
}
