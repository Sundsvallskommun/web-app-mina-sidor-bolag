import { ApiResponse } from '@services/api-service';
import { CustomerRelation } from '@data-contracts/customer/data-contracts';

export const getMyRelations: ApiResponse<CustomerRelation[]> = {
  data: [
    {
      customerNumber: '1',
      organizationNumber: '5564786647',
      organizationName: 'Sundsvall Energi',
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
  message: 'success',
};
