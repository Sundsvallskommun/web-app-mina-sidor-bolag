import { BFUSCustomerIdsApiResponse, BFUSConsentsApiResponse, Consent } from '@interfaces/consent';
import { useApi } from './api-service';
import { QueryKey } from '@tanstack/react-query';
import { User } from '@interfaces/user';

export const consentQueryKeys = {
  consents: 'consents',
  customerIds: 'bfus-customer-ids',
};

export const useGetCustomerId = (user: User | undefined) =>
  useApi<BFUSCustomerIdsApiResponse['data'], Error, number[], QueryKey>({
    url: '/bfus/eligable-party-customer-id',
    method: 'get',
    queryKey: [consentQueryKeys.customerIds],
    dataHandler: (data) => data.customerIds,
    queryOptions: {
      enabled: !!user,
    },
  });

export type Group = { parts: Consent[]; hasBeenProcessed: boolean };

export interface GroupedConsents {
  new: Record<string, Group>;
  current: Consent[];
  closed: Consent[];
}

export const handleConsentResponse = (data: BFUSConsentsApiResponse['data']): GroupedConsents => {
  const closedStatuses = new Set(['denied', 'ended', 'revoked', 'expired']);

  return data.consents.reduce<GroupedConsents>(
    (consents, part) => {
      const { EnergyServiceParty, StatusCategory } = part;

      if (StatusCategory === 'new') {
        consents.new[EnergyServiceParty] ??= {
          parts: [],
          hasBeenProcessed: false,
        };

        consents.new[EnergyServiceParty].parts.push(part);
      }

      if (StatusCategory === 'ongoing') {
        consents.current.push(part);
      }

      if (closedStatuses.has(StatusCategory)) {
        consents.closed.push(part);
      }

      if (StatusCategory !== 'new') {
        if (consents.new[EnergyServiceParty]) {
          consents.new[EnergyServiceParty].hasBeenProcessed = true;
        }
      }

      return consents;
    },
    {
      new: {},
      current: [],
      closed: [],
    }
  );
};

export const consentHandler = (data: BFUSConsentsApiResponse['data']): GroupedConsents => handleConsentResponse(data);
