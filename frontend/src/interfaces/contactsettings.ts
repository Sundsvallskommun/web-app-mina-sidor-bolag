import { User } from './user';

export interface ClientContactSettingNotifications {
  email_disabled: boolean;
  phone_disabled: boolean;
}

export interface ClientContactSettingDecicionsAndDocuments {
  digitalInbox: boolean;
  myPages: boolean;
  snailmail: boolean;
}

export interface ClientContactSettingAddress {
  street: string;
  postcode: string;
  city: string;
}

export interface ClientContactSetting {
  id?: string | null;
  createdById?: string | null;
  alias?: string | null;
  virtual?: boolean;
  name: User['name'];
  email: string | null;
  phone: string | null;
  address?: ClientContactSettingAddress | null;
  notifications?: ClientContactSettingNotifications | null;
  decicionsAndDocuments?: ClientContactSettingDecicionsAndDocuments | null;
  modified?: string;
}

export enum Operator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
}
export interface Rule {
  attributeName: string;
  operator: Operator;
  attributeValue: string;
}

export interface Filter {
  id?: string;
  alias?: string;
  channel?: string;
  created?: string;
  modified?: string;
  rules: Rule[];
}

export interface Delegate {
  id?: string | null;
  principalId?: string;
  agentId?: string;
  created?: string;
  modified?: string;
  filters?: Filter[];
}

export interface DelegatedContactSetting {
  delegate: Delegate;
  contactSetting: ClientContactSetting;
}
