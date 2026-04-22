import { UserEngagement } from '@interfaces/user';
import { ApiResponse } from '@services/api-service';

export const getUserEngagements: ApiResponse<UserEngagement> = {
  data: {
    userPersonNumber: '199001012385',
    userName: 'Test Testsson',
    userPartyId: '12345678-1234-1234-1234-1234567890ab',
    canRepresent: [
      {
        name: 'Testföretag',
        representingNumber: '12345-12345',
        representingMode: 0,
      },
    ],
  },
  message: 'success',
};
