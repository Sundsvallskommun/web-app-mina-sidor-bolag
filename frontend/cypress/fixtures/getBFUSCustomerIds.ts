import { RepresentingMode } from '@interfaces/app';
import { BFUSCustomerIdsApiResponse } from '@interfaces/consent';

export const getBFUSCustomerIds: (representingMode: RepresentingMode) => BFUSCustomerIdsApiResponse = () => ({
  data: { customerIds: [12345678] },
  message: 'success',
});

export const getEmptyBfusCustomerIds: (representingMode: RepresentingMode) => BFUSCustomerIdsApiResponse = () => ({
  data: { customerIds: [] },
  message: 'success',
});
