import { ClientContactSetting, ClientDelegate } from '@data-contracts/backend/data-contracts';

export interface ExtendedClientContactSetting extends ClientContactSetting {
  phoneCountryCode?: string;
  phoneNumber?: string | null;
}

export interface DelegatedContactSetting {
  delegate: ClientDelegate;
  contactSetting: ExtendedClientContactSetting;
}
