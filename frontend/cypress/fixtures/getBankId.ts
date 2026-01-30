import { SignCollectApiResponse } from '@data-contracts/backend/data-contracts';

const uuid = (num: number) => Cypress._.random(num, 1e6);
const transactionId = 'f1586c23-019a-475a-b8c7-d5f7b36e8e96';
const autoStartToken = '23b45ae9-cc11-4f9f-96c3-04b7dbc2f672';
const qrStart = 'cd74b98c-71ed-44d4-aa89-e8e60475d06e';

export const getSignMandate = (random: number) => {
  const qrSecret = uuid(random);
  return {
    message: 'success',
    data: {
      transactionId: uuid(random + 1),
      autoStartToken,
      qrCode: `bankid.${qrStart}.0.${qrSecret}`,
    },
  };
};

export const getStatusPending = (): SignCollectApiResponse => {
  const qrSecret = uuid(2);
  return {
    message: 'success',
    data: {
      transactionId,
      progressStatus: { status: 'PENDING', substatus: 'outstandingTransaction', message: '' },
      qrCode: `bankid.${qrStart}.1.${qrSecret}`,
    },
  };
};
export const getStatusSigning = (): SignCollectApiResponse => {
  const qrSecret = uuid(3);
  return {
    message: 'success',
    data: {
      transactionId,
      progressStatus: { status: 'PENDING', substatus: 'userSign', message: '' },
      qrCode: `bankid.${qrStart}.2.${qrSecret}`,
    },
  };
};
export const getStatusCancelled = (): SignCollectApiResponse => {
  const qrSecret = uuid(4);
  return {
    message: 'success',
    data: {
      transactionId,
      progressStatus: {
        status: 'FAILED',
        substatus: 'cancelled',
        message: '',
      },
      qrCode: `bankid.${qrStart}.3.${qrSecret}`,
    },
  };
};
export const getStatusComplete = (): SignCollectApiResponse => {
  return {
    message: 'success',
    data: {
      transactionId,
      progressStatus: {
        status: 'COMPLETE',
        substatus: null,
        message: '',
      },
    },
  };
};
