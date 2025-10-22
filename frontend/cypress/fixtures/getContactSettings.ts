import { RepresentingMode } from '@interfaces/app';
import { ClientContactSetting } from '@interfaces/contactsettings';
import { ApiResponse } from '@services/api-service';
import { representingModeDefault } from 'cypress/support/e2e';

export const getContactSettings: (representingMode: RepresentingMode) => ApiResponse<ClientContactSetting> = (
  representingMode = representingModeDefault
) => ({
  data: {
    name: `name-${RepresentingMode[representingMode]}`,
    email: 'test@example.com',
    phone: '+46701740605',
    address: {
      street: 'street',
      postcode: 'postcode',
      city: 'city',
    },
    notifications: {
      email_enabled: false,
      phone_enabled: false,
    },
  },
  message: 'success',
});

export const patchContactSettings: () => ApiResponse<ClientContactSetting> = () => ({
  data: {
    id: 'a-a-a-a-a',
    name: 'Förnamn Efternamn',
    address: {
      city: 'SUNDSVALL',
      street: 'Storgatan 1',
      postcode: '111 22',
    },
    email: 'mail@example.com',
    phone: '+46701740635',
    virtual: false,
    alias: 'default',
    notifications: {
      email_enabled: true,
      phone_enabled: true,
    },
    decicionsAndDocuments: {
      digitalInbox: true,
      myPages: true,
      snailmail: false,
    },
  },
  message: 'updated',
});

export const deleteContactSetting: () => { data: boolean; message: string } = () => ({
  data: true,
  message: 'Deleted delegate',
});
