import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { User } from '../interfaces/users.interface';
import { IsNullable } from '../utils/custom-validation-classes';
import { Address } from '@/data-contracts/businessengagements/data-contracts';
import { Delegate as IDelegate, Filter as IFilter, Rule as IRule, Operator } from '@/data-contracts/contactsettings/data-contracts';

export class ClientContactSettingNotifications {
  @IsBoolean()
  email_disabled: boolean;
  @IsBoolean()
  phone_disabled: boolean;
}

export class ClientContactSettingDecicionsAndDocuments {
  @IsBoolean()
  digitalInbox: boolean;
  @IsBoolean()
  myPages: boolean;
  @IsBoolean()
  snailmail: boolean;
}

export class ClientContactSettingAddress implements Omit<Address, 'careOf'> {
  @IsString()
  @IsOptional()
  street?: string;
  @IsString()
  @IsOptional()
  postcode?: string;
  @IsString()
  @IsOptional()
  city?: string;
}

export class ClientContactSetting {
  @IsString()
  @IsOptional()
  id: string | null;
  @IsString()
  @IsOptional()
  name: User['name'];
  @IsString()
  @IsOptional()
  @IsNullable()
  email: string | null;
  @IsString()
  @IsOptional()
  @IsNullable()
  phone: string | null;
  @ValidateNested({ each: true })
  @Type(() => ClientContactSettingAddress)
  @IsOptional()
  @IsNullable()
  address?: ClientContactSettingAddress | null;
  @ValidateNested({ each: true })
  @Type(() => ClientContactSettingNotifications)
  @IsOptional()
  notifications: ClientContactSettingNotifications;
  @ValidateNested({ each: true })
  @Type(() => ClientContactSettingDecicionsAndDocuments)
  @IsOptional()
  decicionsAndDocuments: ClientContactSettingDecicionsAndDocuments;
  @IsBoolean()
  virtual: boolean;
  @IsString()
  @IsNullable()
  alias: string | null;
  @IsString()
  @IsOptional()
  @IsNullable()
  municipalityId?: string | null;
}

export class ClientDelegate implements IDelegate {
  @IsString()
  @IsOptional()
  id?: string | null;
  @IsString()
  @IsOptional()
  principalId?: string;
  @IsString()
  @IsOptional()
  agentId?: string;
  @IsString()
  @IsOptional()
  created?: string;
  @IsString()
  @IsOptional()
  modified?: string;
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Filter)
  filters?: Filter[];
}

export class Filter implements IFilter {
  @IsString()
  @IsOptional()
  id?: string;
  @IsString()
  @IsOptional()
  alias?: string;
  @IsString()
  @IsOptional()
  channel?: string;
  @IsString()
  @IsOptional()
  created?: string;
  @IsString()
  @IsOptional()
  modified?: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Rule)
  rules: IRule[];
}

class Rule implements IRule {
  @IsString()
  attributeName: string;
  @IsEnum(Operator)
  operator: Operator;
  @IsString()
  attributeValue: string;
}

export class DelegatedContactSetting {
  delegate: ClientDelegate;
  contactSetting: ClientContactSetting;
}
