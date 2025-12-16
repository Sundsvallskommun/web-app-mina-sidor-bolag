import {
  BFUSCustomerIdsApiResponse,
  BFUSEligiblePartyPermissionsApiResponse,
  EligablePartyPart,
} from '@interfaces/eligibility';
import { useApi } from './api-service';
import { QueryKey } from '@tanstack/react-query';

export const useGetCustomerId = (enabled: boolean) =>
  useApi<BFUSCustomerIdsApiResponse, Error, number[], QueryKey>({
    url: '/bfus/eligable-party-customer-id',
    method: 'get',
    queryKey: ['bfus-customer-ids'],
    queryOptions: { enabled },
    dataHandler: (data) => data.customerIds,
  });

export const useGetEligiblePartyPermissions = (customerIds: number[] | undefined, enabled: boolean | undefined) =>
  useApi<BFUSEligiblePartyPermissionsApiResponse, Error, EligablePartyPart[], QueryKey>({
    url: '/bfus/eligable-party-permissions',
    method: 'get',
    queryKey: ['bfus-eligible-party-permissions', customerIds],
    axiosParameters: {
      params: {
        customerIds: customerIds?.join(','),
      },
    },
    queryOptions: {
      enabled: enabled && !!customerIds?.length,
    },
    dataHandler: (data) => data.eligablePartyParts,
  });
