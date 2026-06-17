import { ApiResponse } from '@services/api-service';
import { representingModeDefault } from 'cypress/support/e2e';
import { getEngagements } from './getEngagements';
import { getMe } from './getMe';
import { RepresentingBusinessEntity, RepresentingEntity } from '@data-contracts/backend/data-contracts';

export const getBusinessRepresentFromEngagements = (index: number = 0): RepresentingBusinessEntity => ({
  organizationName: getEngagements.data[index].name ?? 'organizationName',
  organizationNumber: getEngagements.data[index].organizationNumber ?? 'organizationNumber',
  information: {
    address: {
      city: 'city',
      street: 'street',
      postcode: 'postcode',
    },
  },
  isAuthorizedSignatory: index < 1,
  whitelisted: index > 1,
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
