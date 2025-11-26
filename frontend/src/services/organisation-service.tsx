import { PersonEngagement } from '@data-contracts/backend/data-contracts';
import { OrganisationInfo } from '@interfaces/organisation-info';
import { useApi } from '@services/api-service';
import { useEffect, useState } from 'react';

export const emptyOrganisationInfo: OrganisationInfo = {
  organizationName: '',
  organizationNumber: '',
  information: {
    address: {
      adressNumber: '',
      addressArea: '',
      city: '',
      postalCode: '',
      municipality: '',
      county: '',
    },
  },
};

interface BusinessToRepresent extends PersonEngagement {
  isRepresentative: boolean;
}

const combineAllBusinessToRepresent = (
  businessEngagements?: PersonEngagement[],
  businessRepresentatives?: PersonEngagement[]
) =>
  (businessEngagements?.map((x) => ({ ...x, isRepresentative: false })) ?? []).concat(
    businessRepresentatives?.map((x) => ({ ...x, isRepresentative: true })) ?? []
  );

export const useCombinedBusinessEngagements = () => {
  const { data: businessEngagements, isLoading: businessEngagementsIsLoading } = useApi<PersonEngagement[]>({
    url: '/businessengagements',
    method: 'get',
  });

  const [engagements, setEngagements] = useState<BusinessToRepresent[]>(
    combineAllBusinessToRepresent(businessEngagements)
  );

  useEffect(() => {
    setEngagements(combineAllBusinessToRepresent(businessEngagements));
  }, [businessEngagements]);
  return {
    engagements: engagements,
    engagementsIsLoading: businessEngagementsIsLoading,
  };
};
