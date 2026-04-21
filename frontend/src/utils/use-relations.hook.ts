import { CustomerRelation } from '@data-contracts/customer/data-contracts';
import { useApi } from '@services/api-service';
import { useMemo } from 'react';
import { agreementCategories } from '@services/agreement-service';
import { Agreement } from '@interfaces/agreement';

export const useRelations = () => {
  const { data: relations } = useApi<CustomerRelation[]>({ url: '/myrelations', method: 'get' });
  const url = '/paged/agreements';
  const { data: allAgreements } = useApi<Agreement[]>({
    url,
    method: 'get',
    queryKey: [url, 'raw'],
  });

  const activeCustomerEngagements = useMemo(() => {
    const allCustomerEngagements = relations?.map((relation) => relation.organizationNumber ?? '') ?? [];
    if (!allAgreements || !relations) return allCustomerEngagements;

    const normalize = (s?: string) => s?.trim().toLowerCase() ?? '';

    // Get contractors from all agreements (not just visible categories) so logos render for all companies
    const contractors = new Set(
      allAgreements
        .map((agreement) => {
          const cat = agreementCategories[agreement.category as keyof typeof agreementCategories];
          return cat ? normalize(cat.contractor) : '';
        })
        .filter(Boolean)
    );

    // Filter relations based on contractors from active agreements
    return relations
      .filter((relation) => contractors.has(normalize(relation.organizationName)))
      .map((relation) => relation.organizationNumber ?? '');
  }, [allAgreements, relations]);

  return { relations, activeCustomerEngagements };
};
