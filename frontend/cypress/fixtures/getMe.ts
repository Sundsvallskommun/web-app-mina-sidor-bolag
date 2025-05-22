import { FeedbackLifespan, User } from '@interfaces/user';
import { ApiResponse } from '@services/api-service';

export const getMe: ApiResponse<User> = {
  data: {
    name: 'Förnamn Efternamn',
    userSettings: {
      feedbackLifespan: FeedbackLifespan.oneMonth,
      readNotificationsClearedDate: '2023-01-01',
    },
    relations: [
      {
        customerNumber: '672086',
        organizationNumber: '5564786647',
        organizationName: 'Sundsvall Energi AB',
        active: true,
      },
      {
        customerNumber: '672086',
        organizationNumber: '5565027223',
        organizationName: 'Sundsvall Elnät',
        active: true,
      },
    ],
    addresses: [
      {
        address: 'Kummelgatan 16',
        facilityIds: ['735999109151605013', '9151605012'],
      },
      {
        address: 'Kummelgatan 16 Solcellsanläggning',
        facilityIds: ['735999109515160509'],
      },
    ],
    facilities: [],
  },
  message: 'success',
};
