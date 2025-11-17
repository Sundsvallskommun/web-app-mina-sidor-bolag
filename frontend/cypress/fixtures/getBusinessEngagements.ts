import { Engagement } from '@data-contracts/businessengagements/data-contracts';
import { ApiResponse } from '@services/api-service';

export const getBusinessEngagements: ApiResponse<Engagement[]> = {
  data: [
    {
      name: 'Styrbjörns båtar',
      organizationNumber: '2021005448',
    },
    {
      name: 'Styrbjörns cyklar',
      organizationNumber: '2021005449',
    },
  ],
  message: 'success',
};
