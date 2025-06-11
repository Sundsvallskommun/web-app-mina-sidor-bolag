import { DelegatedContactSetting, Filter, Operator } from '@interfaces/contactsettings';
import { User } from '@interfaces/user';
import { useApi } from '@services/api-service';
import { Checkbox, FormControl } from '@sk-web-gui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export const DelegateFilter = (props: {
  delegatedContactSetting: DelegatedContactSetting;
  category: 'ELECTRICITY' | 'DISTRICT_HEATING';
  isEdit?: boolean;
}) => {
  const { getValues, setValue } = useFormContext();
  const { data: user } = useApi<User>({ url: '/me', method: 'get' });

  const prettyType =
    props.category === 'ELECTRICITY' ? 'El' : props.category === 'DISTRICT_HEATING' ? 'Fjärrvärme' : '';

  // const delegatedContactSetting = { ...props.delegatedContactSetting };
  const [delegatedContactSetting, setDelegatedContactSetting] = useState({ ...props.delegatedContactSetting });

  // useEffect(() => {
  //   setDelegatedContactSetting(getValues('delegate'));
  // }, [getValues]);

  useEffect(() => {
    // console.log('Delegated contact setting updated:', delegatedContactSetting);
    setValue('delegate', delegatedContactSetting.delegate);
  }, [delegatedContactSetting, setValue]);

  const categoryIsEnabled = useMemo(() => {
    return (
      delegatedContactSetting?.delegate?.filters?.some((f) => {
        return (
          f.rules?.length === 1 &&
          f.rules?.some(
            (rule) =>
              rule.attributeName === 'category' && rule.operator === 'EQUALS' && rule.attributeValue === props.category
          )
        );
      }) ?? false
    );
  }, [delegatedContactSetting?.delegate?.filters, props.category]);

  const addressIsEnabled = useCallback(
    (adress: string) => {
      // Addresses are enabled if, for every facility on the address, there is some filter with exactly one rule that matches the facilityId
      const facilitiesOnAddress = user?.addresses
        ?.find((a) => a.address === adress)
        ?.facilityIds.filter((id) => user?.facilities.find((f) => f.facilityId === id && f.type === prettyType));

      const enabled = facilitiesOnAddress?.every((facilityId) => {
        return delegatedContactSetting?.delegate?.filters?.some((f) => {
          return (
            f.rules?.length === 1 &&
            f.rules?.some(
              (rule) =>
                rule.attributeName === 'facilityId' && rule.operator === 'EQUALS' && rule.attributeValue === facilityId
            )
          );
        });
      });
      return enabled ?? false;
    },
    [delegatedContactSetting?.delegate?.filters, user?.addresses, user?.facilities, prettyType]
  );

  return (
    <>
      {/* <div>DelegateFilter delegate.id: {delegatedContactSetting.delegate.id}</div> */}
      {/* {delegatedContactSetting?.delegate?.filters?.map((f, idx) => {
        return (
          <div key={`${f.id || f.alias || f.rules.map((r) => r.attributeName).join('-')}-${idx}`}>
            <p>
              <strong>{f.alias}</strong>
            </p>
            <ul>
              {f.rules.map((rule) => {
                return (
                  <li key={rule.attributeName + rule.operator + rule.attributeValue}>
                    {rule.attributeName} {rule.operator} {rule.attributeValue}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <p>Kategori är aktiv? {categoryIsEnabled ? 'Ja' : 'Nej'}</p>
      <p>
        Adress är aktiv? {user?.addresses.map((a) => `${a.address}: ${addressIsEnabled(a.address) ? 'Ja' : 'Nej'}`)}
      </p> */}
      <FormControl fieldset className="my-12">
        {/* <Checkbox {...register('contactSetting.')}>Sms</Checkbox> */}
        <Checkbox
          disabled={!props.isEdit}
          onChange={(e) => {
            const filters: Filter[] = getValues('delegate.filters') ?? [];
            if (e.target.checked) {
              // Add a new filter if it doesn't exist
              const newFilter = {
                // id: `filter-${Date.now()}`,
                alias: `Filter för ${prettyType} - ${props.category}`,
                channel: 'se.stadsbacken.minasidor-test',
                rules: [{ attributeName: 'category', operator: 'EQUALS' as Operator, attributeValue: props.category }],
              };
              const updatedFilters = [...filters, newFilter];
              setDelegatedContactSetting({
                ...delegatedContactSetting,
                ...{ delegate: { ...delegatedContactSetting.delegate, filters: updatedFilters } },
              });
            } else if (e.target.checked === false) {
              // Remove the filter if it exists
              const existingFilter = filters.findIndex((f) =>
                f.rules.some(
                  (rule) =>
                    rule.attributeName === 'category' &&
                    rule.operator === ('EQUALS' as const) &&
                    rule.attributeValue === props.category
                )
              );

              if (existingFilter !== -1) {
                const updatedFilters = filters.filter((f, index) => index !== existingFilter);
                setDelegatedContactSetting({
                  ...delegatedContactSetting,
                  ...{ delegate: { ...delegatedContactSetting.delegate, filters: updatedFilters } },
                });
              }
            }
          }}
          checked={categoryIsEnabled}
        >
          Aviseringar för alla adresser
        </Checkbox>
      </FormControl>
      {user?.addresses
        .filter((address) => {
          // filter out addresses that don't have any facilities of the specified type
          const facilitiesOfType = user.facilities
            .filter((facility) => facility.type === prettyType)
            .map((facility) => facility.facilityId);
          return address.facilityIds.some((facilityId) => facilitiesOfType.includes(facilityId));
        })
        .sort((a, b) => a.address.localeCompare(b.address))
        .map((a) => (
          <FormControl key={a.address} fieldset className="my-12">
            <Checkbox
              disabled={categoryIsEnabled || !props.isEdit}
              defaultChecked={addressIsEnabled(a.address)}
              onChange={(e) => {
                const filters = getValues('delegate.filters') ?? [];
                if (e.target.checked) {
                  // Add a filter for each facilityId on the address
                  const facilitiesOfType = user.facilities
                    .filter((facility) => facility.type === prettyType)
                    .map((facility) => facility.facilityId);
                  const newFilters = facilitiesOfType.map((facilityId) => {
                    return {
                      alias: `Filter för ${prettyType} - ${props.category} - ${a.address}`,
                      channel: 'se.stadsbacken.minasidor-test',
                      rules: [
                        { attributeName: 'facilityId', operator: 'EQUALS' as Operator, attributeValue: facilityId },
                      ],
                    };
                  });
                  const updatedFilters = [...filters, ...newFilters];
                  console.log('Updated filters (added new for address):', updatedFilters);
                  setDelegatedContactSetting({
                    ...delegatedContactSetting,
                    ...{ delegate: { ...delegatedContactSetting.delegate, filters: updatedFilters } },
                  });
                } else if (e.target.checked === false) {
                  // Remove the filter for each facilityId on the address
                  const updatedFilters = filters.filter((f) => {
                    const facilitiesOfType = user.facilities
                      .filter((facility) => facility.type === prettyType)
                      .map((facility) => facility.facilityId);
                    return !facilitiesOfType.some((facilityId) =>
                      f.rules.some(
                        (rule) =>
                          rule.attributeName === 'facilityId' &&
                          rule.operator === ('EQUALS' as Operator) &&
                          rule.attributeValue === facilityId
                      )
                    );
                  });
                  console.log('Updated filters (removed for address):', updatedFilters);
                  setDelegatedContactSetting({
                    ...delegatedContactSetting,
                    ...{ delegate: { ...delegatedContactSetting.delegate, filters: updatedFilters } },
                  });
                }
              }}
            >
              {a.address}
            </Checkbox>
          </FormControl>
        ))}
    </>
    // )}
    // </ConnectForm>
  );
};
