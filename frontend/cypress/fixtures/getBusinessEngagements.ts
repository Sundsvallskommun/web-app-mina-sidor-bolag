import { PersonEngagement } from '@data-contracts/backend/data-contracts';
import { ApiResponse } from '@services/api-service';

export const getBusinessEngagements: ApiResponse<PersonEngagement[]> = {
  data: [
    {
      name: 'Styrbjörns båtar',
      organizationNumber: '2021005448',
    },
    {
      name: 'Styrbjörns cyklar',
      organizationNumber: '2021005449',
    },
    {
      name: 'Styrbjörns bilar',
      organizationNumber: '2021005450',
    },
  ],
  message: 'success',
};
