import {
  BFUSCustomerIdsApiResponse,
  BFUSEligiblePartyPermissionsApiResponse,
  EligablePartyPart,
} from '@interfaces/eligibility';
import { useApi } from './api-service';
import { QueryKey } from '@tanstack/react-query';

export const eligibilityQueryKeys = {
  partyPermissions: 'bfus-eligible-party-permissions',
  customerIds: 'bfus-customer-ids',
};

export const useGetCustomerId = () =>
  useApi<BFUSCustomerIdsApiResponse['data'], Error, number[], QueryKey>({
    url: '/bfus/eligable-party-customer-id',
    method: 'get',
    queryKey: [eligibilityQueryKeys.customerIds],
    dataHandler: (data) => data.customerIds,
  });

export const useGetCurrentAndClosedPermissions = (customerIds: number[] | undefined) =>
  useApi<BFUSEligiblePartyPermissionsApiResponse['data'], Error, EligablePartyPart[], QueryKey>({
    url: '/bfus/eligable-party-permissions',
    method: 'get',
    queryKey: [eligibilityQueryKeys.partyPermissions, customerIds],
    axiosParameters: {
      params: {
        customerIds: customerIds?.toString(),
      },
    },
    queryOptions: {
      enabled: !!customerIds && customerIds.length > 0,
    },
    dataHandler: (data) => data.eligablePartyParts.filter((epp) => epp.StatusCategory !== 'new'),
  });
