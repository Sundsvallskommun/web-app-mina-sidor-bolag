import { apiService } from './api-service';
import {
  BFUSCustomerIdsApiResponse,
  BFUSEligiblePartyPermissionsApiResponse,
} from 'src/data-contracts/backend/data-contracts';
import { useApiGet } from 'src/hooks/useApiGet';

export const useGetCustomerIds = () => {
  const fetcher = () =>
    apiService.get<BFUSCustomerIdsApiResponse>('/bfus/eligable-party-customer-id').then((r) => r.data.customerIds);

  return useApiGet(fetcher, [], 'bfus-customer-ids:get.error');
};

export const useGetEligiblePartyPermissions = (customerIds: number[] | null, customerIdsIsLoaded: boolean | null) => {
  const fetcher = async () => {
    if (!customerIds || !customerIds.length) return [];

    const responses = await Promise.all(
      customerIds.map((id) =>
        apiService.get<BFUSEligiblePartyPermissionsApiResponse>(`/bfus/eligable-party-permissions`, {
          params: { customerId: id },
        })
      )
    );

    return responses.flatMap((r) => r.data.eligablePartyParts);
  };

  return useApiGet(fetcher, [customerIds, customerIdsIsLoaded], 'bfus-eligible-party-permissions:get.error');
};
