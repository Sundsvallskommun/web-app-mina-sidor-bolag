import { CitizenApiResponse } from '@data-contracts/backend/data-contracts';

export const getCitizen: CitizenApiResponse = {
  message: 'success',
  data: {
    personId: '12345678-1234-1234-1234-1234567890ab',
    givenname: 'Test',
    lastname: 'Testsson',
  },
};
