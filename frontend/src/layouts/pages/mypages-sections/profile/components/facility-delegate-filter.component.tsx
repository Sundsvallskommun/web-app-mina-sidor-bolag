import { useFormContext } from 'react-hook-form';
import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';
import { Checkbox, FormControl } from '@sk-web-gui/react';
import React, { BaseSyntheticEvent, useEffect, useState } from 'react';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { Facility } from '@interfaces/facility-delegation';

export const FacilityDelegateFilter = () => {
  const { data: userData } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });
  const [userFacilities, setUserFacilities] = useState<InstalledBaseItem[]>([]);

  const { getValues, formState } = useFormContext();

  const facilityIsDelegated = (facilityId: string) => {
    return getValues().facilities?.some((delegated: Facility) => delegated.id === facilityId);
  };

  const handleFacilityDelegationChange = (e: BaseSyntheticEvent, facility: InstalledBaseItem) => {
    const currentFacilities = getValues().facilities;

    if (e.target.checked) {
      currentFacilities.push({
        id: facility.facilityId,
        businessEngagementOrgId: facility.type === 'Fjärrvärme' ? '5564786647' : '5565027223',
      });
    } else {
      const index = currentFacilities.findIndex(function (f: Facility) {
        return f.id === facility.facilityId;
      });

      currentFacilities.splice(index, 1);
    }
  };

  useEffect(() => {
    setUserFacilities(
      userData?.facilities?.filter((facility: InstalledBaseItem & { isDelegated: boolean }) => !facility.isDelegated) ??
        []
    );
  }, [userData]);

  return (
    <div>
      <p className="text-label-medium mt-40 mb-0">Välj anläggning där behörighet ska gälla</p>
      {formState.errors['facilities'] ? <p className="text-small text-error"> Du måste välja en anläggning </p> : null}

      {userFacilities?.length ? (
        <>
          {userFacilities
            ?.filter((f: InstalledBaseItem) => f.type !== 'Elhandel')
            .map((facility: InstalledBaseItem) => {
              return (
                <FormControl key={facility.facilityId} fieldset className="my-12">
                  <Checkbox
                    className="gap-12"
                    defaultChecked={facilityIsDelegated(facility?.facilityId ?? '')}
                    onChange={(e: BaseSyntheticEvent) => handleFacilityDelegationChange(e, facility)}
                  >
                    <p>
                      {facility?.address?.street}, {facility.type}
                      <br /> (Anläggnings-ID: {facility.facilityId})
                    </p>
                  </Checkbox>
                </FormControl>
              );
            })}
        </>
      ) : (
        <div>
          <p>Du har inga valbara anläggningar</p>
        </div>
      )}
    </div>
  );
};
