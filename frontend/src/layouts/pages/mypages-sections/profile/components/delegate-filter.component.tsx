import { DelegatedContactSetting, Filter, Operator, Rule } from '@interfaces/contactsettings';
import { FacilityAddress } from '@interfaces/facility-address';
import { User } from '@interfaces/user';
import { pagedAgreementsHandler } from '@services/agreement-service';
import { useApi } from '@services/api-service';
import { Checkbox, FormControl } from '@sk-web-gui/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const DelegateFilter = (props: {
  delegatedContactSetting: DelegatedContactSetting;
  category: 'ELECTRICITY' | 'DISTRICT_HEATING';
  isEdit?: boolean;
}) => {
  const { getValues, setValue } = useFormContext();
  const { t } = useTranslation(['notifications', 'category']);
  const { data: user } = useApi<User>({ url: '/me', method: 'get' });
  const { data: agreements } = useApi({
    url: `/paged/agreements`,
    method: 'get',
    dataHandler: pagedAgreementsHandler,
  });

  const prettyType = useMemo(() => {
    if (props.category === 'ELECTRICITY') {
      return t('category:electricity');
    } else if (props.category === 'DISTRICT_HEATING') {
      return t('category:districtHeating');
    } else {
      return t('category:unknown');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.category]);

  const [delegatedContactSetting, setDelegatedContactSetting] = useState({ ...props.delegatedContactSetting });

  useEffect(() => {
    setValue('delegate', delegatedContactSetting.delegate);
  }, [delegatedContactSetting, setValue]);

  const ruleAppliesToFacility = (facilityId: string) => (rule: Rule) =>
    rule.attributeName === 'facilityId' && rule.operator === 'EQUALS' && rule.attributeValue === facilityId;

  const ruleAppliesToCategory = (category: string) => (rule: Rule) =>
    rule.attributeName === 'category' && rule.operator === 'EQUALS' && rule.attributeValue === category;

  const filterHasRuleForCategory = (category: string) => (filter: Filter) =>
    filter.rules?.length === 1 && filter.rules?.some(ruleAppliesToCategory(category));

  const filterHasRuleForFacility = (facilityId: string) => (filter: Filter) =>
    filter.rules?.length === 1 && filter.rules?.some(ruleAppliesToFacility(facilityId));

  const categoryIsEnabled = useMemo(
    () => delegatedContactSetting?.delegate?.filters?.some(filterHasRuleForCategory(props.category)) ?? false,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delegatedContactSetting?.delegate?.filters, props.category]
  );

  const addressIsEnabled = useCallback(
    (adress: string) => {
      // Addresses are enabled if, for every facility on the address, there is some filter with exactly one rule that matches the facilityId
      const facilitiesOnAddress = user?.addresses
        ?.find((a) => a.address === adress)
        ?.facilityIds.filter((id) => user?.facilities?.find((f) => f.facilityId === id && f.type === prettyType));

      const facilityIsEnabled = (facilityId: string) =>
        delegatedContactSetting?.delegate?.filters?.some(filterHasRuleForFacility(facilityId)) ?? false;

      const enabled = facilitiesOnAddress?.every(facilityIsEnabled);
      return enabled ?? false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delegatedContactSetting?.delegate?.filters, user?.addresses, user?.facilities, prettyType]
  );

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filters: Filter[] = getValues('delegate.filters') ?? [];
    if (e.target.checked) {
      // Add a new filter if it doesn't exist
      const newFilter = {
        alias: t('notifications:customized.filterCategoryAlias', {
          type: prettyType,
          category: props.category,
        }),
        channel: process.env.NEXT_PUBLIC_DELEGATE_CHANNEL,
        rules: [{ attributeName: 'category', operator: 'EQUALS' as Operator, attributeValue: props.category }],
      };
      const updatedFilters = [...filters, newFilter];
      setDelegatedContactSetting({
        ...delegatedContactSetting,
        ...{ delegate: { ...delegatedContactSetting.delegate, filters: updatedFilters } },
      });
    } else if (e.target.checked === false) {
      // Remove the filter if it exists
      const existingFilter = filters.findIndex((filter) => filter.rules.some(ruleAppliesToCategory(props.category)));

      if (existingFilter !== -1) {
        const updatedFilters = filters.filter((f, index) => index !== existingFilter);
        setDelegatedContactSetting({
          ...delegatedContactSetting,
          ...{ delegate: { ...delegatedContactSetting.delegate, filters: updatedFilters } },
        });
      }
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>, user: User, a: FacilityAddress) => {
    const filters: Filter[] = getValues('delegate.filters') ?? [];
    const facilitiesOfType = user.facilities
      .filter((facility) => facility.type === prettyType)
      .map((facility) => facility.facilityId);

    let updatedFilters: Filter[] = [];

    if (e.target.checked) {
      // Add a filter for each facilityId on the address
      const newFilters = facilitiesOfType.map((facilityId) => {
        return {
          alias: t('notifications:customized.filterAddressAlias', {
            type: prettyType,
            category: props.category,
            address: a.address,
          }),
          channel: process.env.NEXT_PUBLIC_DELEGATE_CHANNEL,
          rules: [
            {
              attributeName: 'facilityId',
              operator: 'EQUALS' as Operator,
              attributeValue: facilityId,
            } as Rule,
          ],
        };
      });
      updatedFilters = [...filters, ...newFilters];
    } else if (e.target.checked === false) {
      // Remove the filter for each facilityId on the address
      const doesNotExistInAnyRule =
        (filter: Filter) =>
        (facilityId: string = '') =>
          !filter.rules.some(ruleAppliesToFacility(facilityId));

      const hasNoFacilityRules = (filter: Filter) => facilitiesOfType.every(doesNotExistInAnyRule(filter));

      updatedFilters = filters.filter(hasNoFacilityRules);
    }
    setDelegatedContactSetting({
      ...delegatedContactSetting,
      ...{ delegate: { ...delegatedContactSetting.delegate, filters: updatedFilters } },
    });
  };

  return (
    <>
      {user?.facilities?.some((facility) => facility.type === prettyType) ? (
        <FormControl fieldset className="my-12">
          <Checkbox
            disabled={!props.isEdit}
            onChange={handleCategoryChange}
            checked={categoryIsEnabled}
            data-cy="delegation-all-addresses-checkbox"
          >
            {t('notifications:customized.allAddresses')}
          </Checkbox>
        </FormControl>
      ) : null}
      {user?.addresses
        .filter((address) => {
          // filter out addresses that don't have any facilities of the specified type
          // and also filter out addresses that don't have any active agreements on those facilities
          const facilitiesOfType = user.facilities
            .filter((facility) => facility.type === prettyType && !facility.isDelegated)
            .map((facility) => facility.facilityId);
          const agreementsFacilityIds =
            Object.values(agreements ?? {})
              .flat()
              .map((a) => a.facilityId) ?? [];
          return address.facilityIds.some(
            (facilityId) => facilitiesOfType.includes(facilityId) && agreementsFacilityIds.includes(facilityId)
          );
        })
        .sort((a, b) => a.address.localeCompare(b.address))
        .map((a) => (
          <FormControl key={a.address} fieldset className="my-12">
            <Checkbox
              disabled={categoryIsEnabled ?? !props.isEdit}
              defaultChecked={addressIsEnabled(a.address)}
              onChange={(e) => handleAddressChange(e, user, a)}
            >
              {a.address}
            </Checkbox>
          </FormControl>
        ))}
    </>
  );
};
