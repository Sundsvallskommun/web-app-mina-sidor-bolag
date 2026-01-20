import { CustomerRelation } from '@data-contracts/customer/data-contracts';
import { useApi } from '@services/api-service';
import { useMemo } from 'react';
import { pagedAgreementsHandler } from '@services/agreement-service';
import { Agreement, AgreementData } from '@interfaces/agreement';

export const useRelations = () => {
  const { data: relations } = useApi<CustomerRelation[]>({ url: '/myrelations', method: 'get' });
  const { data: agreements } = useApi<Agreement[], Error, AgreementData>({
    url: '/paged/agreements',
    method: 'get',
    dataHandler: pagedAgreementsHandler,
  });

  const activeCustomerEngagements = useMemo(() => {
    const allCustomerEngagements = relations?.map((relation) => relation.organizationNumber ?? '') ?? [];
    if (!agreements || !relations) return allCustomerEngagements;

    const normalize = (s?: string) => s?.trim().toLowerCase() ?? '';

    // Get contractors from active agreements, we use names because we do not have organization numbers in agreements, better to be improved later
    const contractors = new Set(
      Object.values(agreements)
        .flat()
        .map((agreement) => normalize(agreement.category.contractor))
        .filter(Boolean)
    );

    // Filter relations based on contractors from active agreements
    return relations
      .filter((relation) => contractors.has(normalize(relation.organizationName)))
      .map((relation) => relation.organizationNumber ?? '');
  }, [agreements, relations]);

  return { relations, activeCustomerEngagements };
};
