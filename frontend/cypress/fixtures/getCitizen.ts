import { CitizenApiRespnse } from '@data-contracts/backend';

export const getCitizen: CitizenApiRespnse = {
  message: 'success',
  data: {
    personId: '12345678-1234-1234-1234-1234567890ab',
    givenname: 'Test',
    lastname: 'Testsson',
  },
};
