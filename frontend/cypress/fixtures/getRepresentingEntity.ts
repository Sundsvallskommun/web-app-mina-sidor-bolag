import { ApiResponse } from '@services/api-service';
import { representingModeDefault } from 'cypress/support/e2e';
import { getBusinessEngagements } from './getBusinessEngagements';
import { getMe } from './getMe';
import { RepresentingBusinessEntity, RepresentingEntity } from '@data-contracts/backend/data-contracts';

export const getBusinessRepresentFromEngagements = (index: number = 0) => ({
  organizationName: getBusinessEngagements.data[index].name ?? 'organizationName',
  organizationNumber: getBusinessEngagements.data[index].organizationNumber ?? 'organizationNumber',
  information: {
    address: {
      city: 'city',
      street: 'street',
      postcode: 'postcode',
    },
  },
  isAuthorizedSignatory: index < 1,
});

export const getPrivateRepresentFromGetMe = () => ({
  name: getMe.data.name ?? 'name',
});

export const getRepresentingEntity: (
  options?: RepresentingEntity & { businessIndex?: number }
) => ApiResponse<RepresentingEntity> = (options) => ({
  data: {
    BUSINESS: options?.BUSINESS || getBusinessRepresentFromEngagements(options?.businessIndex ?? 0),
    PRIVATE: options?.PRIVATE || getPrivateRepresentFromGetMe(),
    mode: options?.mode ?? representingModeDefault,
  },
  message: '',
});
