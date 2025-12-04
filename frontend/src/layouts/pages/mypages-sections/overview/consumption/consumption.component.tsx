'use client';

import { ConsumptionCard } from '@layouts/pages/mypages-sections/overview/consumption/consumption-card.component';
import { Select, Spinner } from '@sk-web-gui/react';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { useEffect, useState } from 'react';
import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';
import dayjs from 'dayjs';
import { pagedAgreementsHandler } from '@services/agreement-service';
import { RefinedAgreement } from '@interfaces/agreement';
import { FacilityAddress } from '@interfaces/facility-address';
import { useTranslation } from 'react-i18next';

export const Consumption = () => {
  const {
    data: user,
    isFetching: isUserFetching,
    isFetched: userIsFetched,
  } = useApi<User>({
    url: '/me',
    method: 'get',
    queryKey: ['user'],
  });

  const { data: customerCode } = useApi({
    url: '/customer-code',
    method: 'get',
    queryOptions: { enabled: userIsFetched },
  });

  console.log(customerCode);

  const { data: agreements, isFetching: isAgreementsFetching } = useApi({
    url: `/paged/agreements`,
    method: 'get',
    dataHandler: pagedAgreementsHandler,
  });

  const [address, setAddress] = useState<string>();
  const [facilities, setFacilities] = useState<InstalledBaseItem[]>();
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const { t } = useTranslation(['common', 'overview']);

  const hasAgreement = (a: FacilityAddress) => Boolean(a.address && agreements?.[a.address]?.length);

  useEffect(() => {
    setAddress(user?.addresses?.filter(hasAgreement)?.[0]?.address ?? '');
    setIsFiltering(true);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, agreements]);

  useEffect(() => {
    if (user && agreements) {
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
      setIsFiltering(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agreements, address, user]);

  const thisMonth = dayjs();

  const consumption =
    user && facilities?.length ? (
      <div>
        <p className="text-large mb-32">
          {t('overview:consumption.description', { month: thisMonth.format('MMMM YYYY').toLowerCase() })}
        </p>
        {user.addresses?.filter(hasAgreement).length > 1 && (
          <div className="sm:flex sm:flex-row flex-nowrap items-center pb-24 gap-16 block">
            <strong>{t('common:address')}</strong>
            <Select className="sm:w-auto sm:mt-0 mt-8 w-full" onChange={(e) => setAddress(e.target.value)} size="sm">
              {user.addresses?.filter(hasAgreement).map((address) => (
                <Select.Option key={address?.address ?? 'unknown'}>
                  {address?.address ? address.address : t('common:unknownAddress')}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}
        <div className="w-full md:flex md:flex-wrap md:gap-24 block" data-cy="consumption-card-wrapper">
          {facilities?.map((facility) => {
            return <ConsumptionCard key={facility.facilityId} facility={facility} date={thisMonth} />;
          })}
        </div>
      </div>
    ) : (
      <p>{t('overview:consumption.noConsumption')}</p>
    );

  return (
    <section className="pb-80 visible">
      <h1>{t('overview:consumption.title')}</h1>

      {isUserFetching || isAgreementsFetching || isFiltering ? <Spinner className="mx-auto" /> : consumption}
    </section>
  );
};
