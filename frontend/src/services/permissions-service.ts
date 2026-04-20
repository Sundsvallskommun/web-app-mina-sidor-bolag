import {
  BFUSCustomerIdsApiResponse,
  BFUSEligiblePartyPermissionsApiResponse,
  EligablePartyPart,
} from '@interfaces/eligibility';
import { useApi } from './api-service';
import { QueryKey } from '@tanstack/react-query';
import { User } from '@interfaces/user';

export const eligibilityQueryKeys = {
  partyPermissions: 'bfus-eligible-party-permissions',
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

export type Group = { parts: EligablePartyPart[]; hasBeenProcessed: boolean };

export interface Permissions {
  new: Record<string, Group>;
  current: EligablePartyPart[];
  closed: EligablePartyPart[];
}

export const handlePermissionResponse = (data: BFUSEligiblePartyPermissionsApiResponse['data']): Permissions => {
  const closedStatuses = new Set(['denied', 'ended', 'revoked', 'expired']);

  return data.eligablePartyParts.reduce<Permissions>(
    (permissions, part) => {
      const { EnergyServiceParty, StatusCategory } = part;

      if (StatusCategory === 'new') {
        permissions.new[EnergyServiceParty] ??= {
          parts: [],
          hasBeenProcessed: false,
        };

        permissions.new[EnergyServiceParty].parts.push(part);
      }

      if (StatusCategory === 'ongoing') {
        permissions.current.push(part);
      }

      if (closedStatuses.has(StatusCategory)) {
        permissions.closed.push(part);
      }

      if (StatusCategory !== 'new') {
        if (permissions.new[EnergyServiceParty]) {
          permissions.new[EnergyServiceParty].hasBeenProcessed = true;
        }
      }

      return permissions;
    },
    {
      new: {},
      current: [],
      closed: [],
    }
  );
};

export const permissionsHandler = (data: BFUSEligiblePartyPermissionsApiResponse['data']): Permissions =>
  handlePermissionResponse(data);
