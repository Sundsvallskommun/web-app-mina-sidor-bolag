import { ApiResponse } from '@services/api-service';
import { CustomerRelation } from '@data-contracts/customer/data-contracts';

export const getMyRelations: () => ApiResponse<CustomerRelation[]> = () => ({
  data: [
    {
      customerNumber: '1',
      organizationNumber: '5564786647',
      organizationName: 'Sundsvall Energi',
      active: true,
    },
    {
      customerNumber: '1',
      organizationNumber: '5565027223',
      organizationName: 'Sundsvall Elnät',
      active: true,
    },
  ],
  message: 'success',
});
