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

interface RepresentableEntity extends PersonEngagement {
  isRepresentative: boolean;
}

const combineRepresentableEntities = (engagements?: PersonEngagement[], businessRepresentatives?: PersonEngagement[]) =>
  (engagements?.map((x) => ({ ...x, isRepresentative: false })) ?? []).concat(
    businessRepresentatives?.map((x) => ({ ...x, isRepresentative: true })) ?? []
  );

export const useRepresentableEntities = () => {
  const { data: representingEngagements, isLoading: representingEngagementsIsLoading } = useApi<PersonEngagement[]>({
    url: '/engagements',
    method: 'get',
  });

  const [engagements, setEngagements] = useState<RepresentableEntity[]>(
    combineRepresentableEntities(representingEngagements)
  );

  useEffect(() => {
    setEngagements(combineRepresentableEntities(representingEngagements));
  }, [representingEngagements]);
  return {
    engagements: engagements,
    engagementsIsLoading: representingEngagementsIsLoading,
  };
};
