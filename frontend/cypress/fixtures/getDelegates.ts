import { ClientDelegate } from '@data-contracts/backend/data-contracts';
import { DelegatedContactSetting } from '@interfaces/contactsettings';
import { ApiResponse } from '@services/api-service';

export const getDelegates: () => ApiResponse<DelegatedContactSetting[]> = () => ({
  data: [
    {
      delegate: {
        id: 'a-a-a-a-a',
        principalId: 'b-b-b-b-b',
        agentId: 'c-c-c-c-c',
        created: '2025-01-01T14:21:18.727+02:00',
        filters: [
          {
            id: 'd-d-d-d-d',
            alias: 'Filter för El - ELECTRICITY - Storgatan 1',
            channel: 'se.stadsbacken.minasidor-test',
            created: '2025-01-01T14:21:18.727+02:00',
            rules: [
              {
                attributeName: 'facilityId',
                operator: 'EQUALS',
                attributeValue: '111',
              },
            ],
          },
        ],
      },
      contactSetting: {
        id: 'e-e-e-e-e',
        name: '',
        address: null,
        email: null,
        phone: '0701740635',
        virtual: true,
        alias: 'Kontaktperson',
        notifications: {
          email_enabled: false,
          phone_enabled: false,
        },
        decicionsAndDocuments: {
          digitalInbox: true,
          myPages: true,
          snailmail: false,
        },
      },
    },
  ],
  message: 'success',
});

export const patchDelegates: () => ApiResponse<DelegatedContactSetting[]> = () => ({
  data: [
    {
      delegate: {
        id: 'a-a-a-a-a',
        principalId: 'b-b-b-b-b',
        agentId: 'c-c-c-c-c',
        created: '2025-01-01T14:21:18.727+02:00',
        filters: [
          {
            id: 'd-d-d-d-d',
            alias: 'Filter för El - ELECTRICITY - Storgatan 1',
            channel: 'se.stadsbacken.minasidor-test',
            created: '2025-01-01T14:21:18.727+02:00',
            rules: [
              {
                attributeName: 'facilityId',
                operator: 'EQUALS',
                attributeValue: '111',
              },
            ],
          },
        ],
      },
      contactSetting: {
        id: 'e-e-e-e-e',
        name: '',
        address: null,
        email: null,
        phone: '+46701740635',
        virtual: true,
        alias: 'Kontaktperson Kontaktpersonsson',
        notifications: {
          email_enabled: false,
          phone_enabled: false,
        },
        decicionsAndDocuments: {
          digitalInbox: true,
          myPages: true,
          snailmail: false,
        },
      },
    },
  ],
  message: 'success',
});

export const postDelegate: () => ApiResponse<ClientDelegate> = () => ({
  data: {
    agentId: 'q-q-q-q-q',
    principalId: 'r-r-r-r-r',
    filters: [
      {
        alias: 'Filter för El - ELECTRICITY',
        channel: 'se.stadsbacken.minasidor-test',
        rules: [
          {
            attributeName: 'category',
            operator: 'EQUALS',
            attributeValue: 'ELECTRICITY',
          },
        ],
      },
      {
        alias: 'Filter för Fjärrvärme - DISTRICT_HEATING',
        channel: 'se.stadsbacken.minasidor-test',
        rules: [
          {
            attributeName: 'category',
            operator: 'EQUALS',
            attributeValue: 'DISTRICT_HEATING',
          },
        ],
      },
    ],
    id: 's-s-s-s-s',
  },
  message: 'updated',
});

export const deleteDelegate: () => { data: boolean; message: string } = () => ({
  data: true,
  message: 'Deleted delegate',
});
