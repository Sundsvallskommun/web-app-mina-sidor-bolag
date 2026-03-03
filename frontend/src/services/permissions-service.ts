import {
  BFUSCustomerIdsApiResponse,
  BFUSEligiblePartyPermissionsApiResponse,
  EligablePartyPart,
  PermissionStatusCategory,
} from '@interfaces/eligibility';
import { useApi } from './api-service';
import { QueryKey } from '@tanstack/react-query';
import { User } from '@interfaces/user';

export const eligibilityQueryKeys = {
  partyPermissions: 'bfus-eligible-party-permissions',
  newPermissions: 'eligibility-new-permissions',
  currentAndClosedPermissions: 'eligibility-current-and-closed-permissions',
  customerIds: 'bfus-customer-ids',
};

export const useGetCustomerId = (user: User | undefined) =>
  useApi<BFUSCustomerIdsApiResponse['data'], Error, number[], QueryKey>({
    url: '/bfus/eligable-party-customer-id',
    method: 'get',
    queryKey: [eligibilityQueryKeys.customerIds],
    dataHandler: (data) => data.customerIds,
    queryOptions: {
      enabled: !!user,
    },
  });

export const handleEligibilityResponse =
  (statuses: PermissionStatusCategory | PermissionStatusCategory[]) =>
  (data: BFUSEligiblePartyPermissionsApiResponse['data']): { [key: string]: EligablePartyPart[] } => {
    if (!data) {
      return {};
    }

    const statusList = Array.isArray(statuses) ? statuses : [statuses];

    return data.eligablePartyParts
      .filter((part) => statusList.includes(part.StatusCategory))
      .reduce(
        (r: { [key: string]: EligablePartyPart[] }, a) => {
          const key = a.EnergyServiceParty;
          (r[key] ??= []).push(a);
          return r;
        },
        {} as { [key: string]: EligablePartyPart[] }
      );
  };
