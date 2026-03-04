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

export type Group = { parts: EligablePartyPart[]; hasBeenProcessed: boolean };

export interface Permissions {
  new: Record<string, Group>;
  current: EligablePartyPart[];
  closed: EligablePartyPart[];
}

export const handlePermissionResponse: (data: BFUSEligiblePartyPermissionsApiResponse['data']) => Permissions = (
  data
) => {
  const grouped = data.eligablePartyParts.reduce<Record<string, Group>>((acc, part) => {
    const key = part.EnergyServiceParty;

    acc[key] ??= { parts: [], hasBeenProcessed: false };
    acc[key].parts.push(part);

    if (part.StatusCategory !== 'new') {
      acc[key].hasBeenProcessed = true;
    }

    return acc;
  }, {});

  const newPermissions = Object.fromEntries(
    Object.entries(grouped)
      .map(([key, group]) => {
        const nextGroup: Group = {
          ...group,
          parts: group.parts.filter((p) => p.StatusCategory === 'new'),
        };
        return [key, nextGroup] as const;
      })
      .filter(([, group]) => group.parts.length > 0)
  );

  const currentPermissions = data.eligablePartyParts.filter((part) => part.StatusCategory === 'ongoing');

  const closedStatuses = ['denied', 'ended', 'revoked', 'expired'];
  const closedPermissions = data.eligablePartyParts.filter((part) => closedStatuses.includes(part.StatusCategory));

  return {
    new: newPermissions,
    current: currentPermissions,
    closed: closedPermissions,
  };
};

export const permissionsHandler = (data: BFUSEligiblePartyPermissionsApiResponse['data']): Permissions =>
  handlePermissionResponse(data);
