import { RepresentingMode } from '@interfaces/app';
import { BFUSCustomerIdsApiResponse } from '@interfaces/eligibility';

export const getBfusCustomerIds: (representingMode: RepresentingMode) => BFUSCustomerIdsApiResponse = () => ({
  data: { customerIds: [12345678] },
  message: 'success',
});
