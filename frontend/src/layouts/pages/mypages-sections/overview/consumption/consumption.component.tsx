'use client';

import { ConsumptionCard } from '@layouts/pages/mypages-sections/overview/consumption/consumption-card.component';
import { Select, Spinner } from '@sk-web-gui/react';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { useEffect, useState } from 'react';
import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';
import dayjs from 'dayjs';
import { RefinedAgreement } from '@interfaces/agreement';
import { FacilityAddress } from '@interfaces/facility-address';
import { useTranslation } from 'react-i18next';
import { usePagedAgreements } from '@utils/use-paged-agreements.hook';

export const Consumption = () => {
  const { data: user, isFetching: isUserFetching } = useApi<User>({
    url: '/me',
    method: 'get',
    queryKey: ['user'],
  });

  const {
    agreements,
    isFetching: isAgreementsFetching,
    isDone: isAgreementsDone,
    currentPage,
  } = usePagedAgreements(200);

  const [address, setAddress] = useState<string>();
  const [facilities, setFacilities] = useState<InstalledBaseItem[]>();
  const [hasInitialAddress, setHasInitialAddress] = useState(false);
  const { t } = useTranslation(['common', 'overview']);

  const hasAgreement = (a: FacilityAddress) => Boolean(a.address && agreements?.[a.address]?.length);

  const addressesWithAgreements = user?.addresses?.filter(hasAgreement) ?? [];

  useEffect(() => {
    if (!hasInitialAddress && addressesWithAgreements.length > 0) {
      setAddress(addressesWithAgreements[0]?.address ?? '');
      setHasInitialAddress(true);
    }
  }, [addressesWithAgreements, hasInitialAddress]);

  useEffect(() => {
    if (user && address && agreements) {
      let filteredFacilities: InstalledBaseItem[] = [];
      for (const agreementAddress in agreements) {
        if (agreementAddress === address) {
          const agreementsFacilities: string[] = agreements[address]?.map(
            (agreement: RefinedAgreement) => agreement.facilityId
          );

          filteredFacilities =
            user?.facilities?.filter(
              (facility: InstalledBaseItem) =>
                (facility.type === 'El' || facility.type === 'Fjärrvärme' || facility.type === 'Elproduktion') &&
                facility?.address?.street === address &&
                agreementsFacilities?.some((agreement) => agreement === facility?.facilityId)
            ) ?? [];
        }
      }
      setFacilities(filteredFacilities);
    }
  }, [agreements, address, user]);

  const thisMonth = dayjs();

  const isLoading = isUserFetching || (isAgreementsFetching && addressesWithAgreements.length === 0);
  const hasData = user && addressesWithAgreements.length > 0 && facilities?.length;

  const consumption = hasData ? (
    <div>
      <p className="text-large mb-32">
        {t('overview:consumption.description', { month: thisMonth.format('MMMM YYYY').toLowerCase() })}
      </p>
      {addressesWithAgreements.length > 1 && (
        <div className="sm:flex sm:flex-row flex-nowrap items-center pb-24 gap-16 block">
          <strong>{t('common:address')}</strong>
          <Select className="sm:w-auto sm:mt-0 mt-8 w-full" onChange={(e) => setAddress(e.target.value)} size="sm">
            {addressesWithAgreements.map((addr) => (
              <Select.Option key={addr?.address ?? 'unknown'}>
                {addr?.address ? addr.address : t('common:unknownAddress')}
              </Select.Option>
            ))}
          </Select>
        </div>
      )}
      {!isAgreementsDone && (
        <div className="flex items-center gap-8 mb-16">
          <Spinner size={2} />
          <p className="text-small"> {t('overview:consumption.fetchingPagesStatus', { currentPage })}</p>
        </div>
      )}
      <div className="w-full md:flex md:flex-wrap md:gap-24 block" data-cy="consumption-card-wrapper">
        {facilities?.map((facility) => {
          return <ConsumptionCard key={facility.facilityId} facility={facility} date={thisMonth} />;
        })}
      </div>
    </div>
  ) : isAgreementsDone ? (
    <p>{t('overview:consumption.noConsumption')}</p>
  ) : null;

  return (
    <section className="pb-80 visible">
      <h1>{t('overview:consumption.title')}</h1>
      {isLoading ? <Spinner className="mx-auto" /> : consumption}
    </section>
  );
};
