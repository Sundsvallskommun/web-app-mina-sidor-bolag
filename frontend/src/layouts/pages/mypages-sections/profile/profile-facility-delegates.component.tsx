import { ResolvedFacilityDelegation } from '@interfaces/facility-delegation';
import { FacilityDelegateItem } from '@layouts/pages/mypages-sections/profile/components/facility-delegate-item.component';
import { useApi } from '@services/api-service';
import { useTranslation } from 'react-i18next';

const emptyFacilityDelegate: ResolvedFacilityDelegation = {
  facilities: [],
  delegatedTo: '',
  owner: '',
  delegatedToBirthDate: '',
  delegatedToName: '',
};

export const FacilityDelegates = () => {
  const { t } = useTranslation('profile');

  const { data: facilityDelegations } = useApi<ResolvedFacilityDelegation[]>({
    url: `facility/delegations`,
    method: 'get',
    queryKey: ['facilityDelegation'],
  });

  return (
    <div>
      <p>{t('profile:delegates.information')}</p>

      {facilityDelegations?.length ? (
        <div className="pt-40">
          <strong>{t('profile:delegates.subTitle')}</strong>
          {facilityDelegations.map((facilityDelegate: ResolvedFacilityDelegation) => (
            <FacilityDelegateItem facilityDelegate={facilityDelegate} key={facilityDelegate?.id} />
          ))}
        </div>
      ) : null}

      <FacilityDelegateItem newItem={true} facilityDelegate={emptyFacilityDelegate} close={() => {}} />
    </div>
  );
};
