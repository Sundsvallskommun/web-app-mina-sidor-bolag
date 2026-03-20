import { FeedbackLifespan, User } from '@interfaces/user';
import { ApiResponse } from '@services/api-service';

export const getMe: ApiResponse<User> = {
  data: {
    name: 'Förnamn Efternamn',
    userSettings: {
      feedbackLifespan: FeedbackLifespan.oneMonth,
      readNotificationsClearedDate: '2025-01-01',
    },
    relations: {
      customerNumber: '1',
      customerRelations: [
        {
          customerNumber: '1',
          organizationNumber: '5564786647',
          organizationName: 'Sundsvall Energi AB',
          active: true,
          moveInDate: '2025-01-01',
        },
        {
          customerNumber: '1',
          organizationNumber: '5565027223',
          organizationName: 'Sundsvall Elnät',
          active: true,
          moveInDate: '2025-01-01',
        },
      ],
    },
    addresses: [
      {
        address: 'Storgatan 1',
        facilityIds: ['111', '222', '333'],
      },
    ],
    facilities: [
      {
        type: 'El',
        facilityId: '111',
        placementId: -1,
        facilityCommitmentStartDate: '2025-01-01',
        address: {
          careOf: 'Förnamn Efternamn',
          street: 'Storgatan 1',
          postalCode: '111 22',
          city: 'SUNDSVALL',
        },
        metaData: [
          {
            key: 'environmentfriendly',
            value: 'true',
            type: 'bool',
            displayName: 'bra miljöval',
          },
          {
            key: 'netarea',
            value: 'Sundsvall tätort',
            type: 'location',
            displayName: 'Nätområde',
          },
          {
            key: 'netareaid',
            value: 'SUV',
            type: 'location',
            displayName: 'NätområdesID',
          },
          {
            key: 'siteStatus',
            value: 'Normal',
            type: 'string',
            displayName: 'Sitestatus',
          },
        ],
      },
      {
        type: 'Elhandel',
        facilityId: '222',
        placementId: -2,
        facilityCommitmentStartDate: '2025-01-01',
        address: {
          careOf: 'Förnamn Efternamn',
          street: 'Storgatan 1',
          postalCode: '111 22',
          city: 'SUNDSVALL',
        },
        metaData: [
          {
            key: 'issmallproduction',
            value: 'true',
            type: 'bool',
            displayName: 'Småskalig produktion',
          },
          {
            key: 'netarea',
            value: 'Sundsvall tätort',
            type: 'location',
            displayName: 'Nätområde',
          },
          {
            key: 'netareaid',
            value: 'SUV',
            type: 'location',
            displayName: 'NätområdesID',
          },
          {
            key: 'siteStatus',
            value: 'Normal',
            type: 'string',
            displayName: 'Sitestatus',
          },
        ],
      },
      {
        type: 'Fjärrvärme',
        facilityId: '333',
        placementId: 3,
        facilityCommitmentStartDate: '2025-01-01',
        lastModifiedDate: '2024-03-01',
        address: {
          propertyDesignation: 'SUNDSVALL 1',
          careOf: 'Förnamn Efternamn',
          street: 'Storgatan 1',
          postalCode: '111 22',
          city: 'SUNDSVALL',
        },
        metaData: [
          {
            key: 'annualusage',
            value: '30',
            type: 'MWh',
            displayName: 'Beräknad årlig förbrukning',
          },
          {
            key: 'debiteffect',
            value: '14',
            type: 'kW',
            displayName: 'Abonnerad effekt',
          },
          {
            key: 'directheatingServiceagreement',
            value: 'true',
            type: 'bool',
            displayName: 'Serviceavtal fjärrvärme',
          },
          {
            key: 'netarea',
            value: 'Sundsvall',
            type: 'location',
            displayName: 'Nätområde',
          },
          {
            key: 'placementStatus',
            value: 'Tillkopplad',
            type: 'string',
            displayName: 'Anläggningsstatus',
          },
          {
            key: 'propertyDesignation',
            value: 'SUNDSVALL 1',
            type: 'string',
            displayName: 'Fastighetsbeteckning',
          },
          {
            key: 'siteStatus',
            value: 'Normal',
            type: 'string',
            displayName: 'Sitestatus',
          },
        ],
      },
      {
        type: 'El',
        facilityId: '111',
        placementId: 4,
        facilityCommitmentStartDate: '2025-01-01',
        lastModifiedDate: '2025-01-01',
        address: {
          careOf: 'Förnamn Efternamn',
          street: 'Storgatan 1',
          postalCode: '111 22',
          city: 'SUNDSVALL',
        },
        metaData: [
          {
            key: 'annualusage',
            value: '11111',
            type: 'kWh',
            displayName: 'Beräknad årlig förbrukning',
          },
          {
            key: 'equipmentNumber',
            value: '111111',
            type: 'string',
            displayName: 'Mätarnummer',
          },
          {
            key: 'fusesize',
            value: '20',
            type: 'A',
            displayName: 'Säkringsstorlek',
          },
          {
            key: 'netarea',
            value: 'Sundsvall tätort',
            type: 'location',
            displayName: 'Nätområde',
          },
          {
            key: 'netareaid',
            value: 'SUV',
            type: 'location',
            displayName: 'NätområdesID',
          },
          {
            key: 'placementStatus',
            value: 'Tillkopplad',
            type: 'string',
            displayName: 'Anläggningsstatus',
          },
          {
            key: 'siteStatus',
            value: 'Normal',
            type: 'string',
            displayName: 'Sitestatus',
          },
        ],
      },
      {
        type: 'Elproduktion',
        facilityId: '222',
        placementId: 5,
        facilityCommitmentStartDate: '2025-01-01',
        lastModifiedDate: '2025-01-01',
        address: {
          careOf: 'Förnamn Efternamn',
          street: 'Storgatan 1',
          postalCode: '111 22',
          city: 'SUNDSVALL',
        },
        metaData: [
          {
            key: 'annualusage',
            value: '1111',
            type: 'kWh',
            displayName: 'Beräknad årlig förbrukning',
          },
          {
            key: 'equipmentNumber',
            value: '111122',
            type: 'string',
            displayName: 'Mätarnummer',
          },
          {
            key: 'isproduction',
            value: 'true',
            type: 'bool',
            displayName: 'Produktionsanläggning',
          },
          {
            key: 'netarea',
            value: 'Sundsvall tätort',
            type: 'location',
            displayName: 'Nätområde',
          },
          {
            key: 'netareaid',
            value: 'SUV',
            type: 'location',
            displayName: 'NätområdesID',
          },
          {
            key: 'placementStatus',
            value: 'Tillkopplad',
            type: 'string',
            displayName: 'Anläggningsstatus',
          },
          {
            key: 'propertyDesignation',
            value: 'SUNDSVALL 1',
            type: 'string',
            displayName: 'Fastighetsbeteckning',
          },
          {
            key: 'siteStatus',
            value: 'Normal',
            type: 'string',
            displayName: 'Sitestatus',
          },
        ],
      },
    ],
    extendedView: true,
  },
  message: 'success',
};

export const getMeOnlyTrade: ApiResponse<User> = {
  data: {
    name: 'Förnamn Efternamn',
    userSettings: {
      feedbackLifespan: FeedbackLifespan.oneMonth,
      readNotificationsClearedDate: '2025-01-01',
    },
    relations: {
      customerNumber: '1',
      customerRelations: [
        {
          customerNumber: '1',
          organizationNumber: '5565027223',
          organizationName: 'Sundsvall Elnät',
          active: true,
          moveInDate: '2025-01-01',
        },
      ],
    },
    addresses: [
      {
        address: 'Storgatan 1',
        facilityIds: ['111'],
      },
    ],
    facilities: [
      {
        type: 'El',
        facilityId: '111',
        placementId: -2,
        facilityCommitmentStartDate: '2025-01-01',
        address: {
          careOf: 'Förnamn Efternamn',
          street: 'Storgatan 1',
          postalCode: '111 22',
          city: 'SUNDSVALL',
        },
        metaData: [
          {
            key: 'issmallproduction',
            value: 'true',
            type: 'bool',
            displayName: 'Småskalig produktion',
          },
          {
            key: 'netarea',
            value: 'Sundsvall tätort',
            type: 'location',
            displayName: 'Nätområde',
          },
          {
            key: 'netareaid',
            value: 'SUV',
            type: 'location',
            displayName: 'NätområdesID',
          },
          {
            key: 'siteStatus',
            value: 'Normal',
            type: 'string',
            displayName: 'Sitestatus',
          },
        ],
      },
    ],
    extendedView: false,
  },
  message: 'success',
};
