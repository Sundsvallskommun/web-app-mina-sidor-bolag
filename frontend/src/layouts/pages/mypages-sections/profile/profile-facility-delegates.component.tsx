import React, { useState } from 'react';
import { useApi } from '@services/api-service';
import { FacilityDelegateItem } from '@layouts/pages/mypages-sections/profile/components/facility-delegate-item.component';
import { FacilityDelegation, ResolvedFacilityDelegation } from '@interfaces/facility-delegation';

const emptyFacilityDelegate: ResolvedFacilityDelegation = {
  facilities: [],
  delegatedTo: '',
  owner: '',
  delegatedToBirthDate: '',
  delegatedToName: '',
};

export const FacilityDelegates = () => {
  const { data: facilityDelegations } = useApi<FacilityDelegation[]>({
    url: `facility/delegations`,
    method: 'get',
    queryKey: ['facilityDelegation'],
  });

  const [, setNewItem] = useState(false);

  return (
    <div className="pt-24">
      <p>
        Du kan ge en person behörighet till dina avtal och dokument. Kom ihåg att du själv måste ta bort behörigheten om
        personen inte längre ska kunna se eller göra ändringar i avtalen.
      </p>

      {facilityDelegations?.length ? (
        <div className="pt-40">
          <strong>Tillagda behörigheter</strong>
          {facilityDelegations.map((facilityDelegate: ResolvedFacilityDelegation) => (
            <FacilityDelegateItem
              facilityDelegate={facilityDelegate}
              key={facilityDelegate?.id}
              close={() => setNewItem(false)}
            />
          ))}
        </div>
      ) : null}

      <FacilityDelegateItem
        newItem={true}
        facilityDelegate={emptyFacilityDelegate}
        close={() => {
          setNewItem(false);
        }}
      />
    </div>
  );
};
