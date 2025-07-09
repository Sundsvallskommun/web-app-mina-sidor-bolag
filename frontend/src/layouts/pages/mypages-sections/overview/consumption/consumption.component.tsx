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

export const Consumption = () => {
  const { data: user, isFetching: isUserFetching } = useApi<User>({
    url: '/me',
    method: 'get',
    queryKey: ['user'],
  });

  const { data: agreements, isFetching: isAgreementsFetching } = useApi({
    url: `/paged/agreements`,
    method: 'get',
    dataHandler: pagedAgreementsHandler,
  });

  const [address, setAddress] = useState<string>();
  const [facilities, setFacilities] = useState<InstalledBaseItem[]>();
  const [isFiltering, setIsFiltering] = useState<boolean>(false);

  useEffect(() => {
    setAddress(user?.addresses?.[0]?.address ?? '');
    setIsFiltering(true);
  }, [user, agreements]);

  useEffect(() => {
    if (user && agreements) {
      for (const agreementAddress in agreements) {
        if (agreementAddress === address) {
          const agreementsFacilities: string[] = agreements[address].map(
            (agreement: RefinedAgreement) => agreement.facilityId
          );

          const filteredFacilities = user?.facilities.filter(
            (facility: InstalledBaseItem) =>
              (facility.type === 'El' || facility.type === 'Fjärrvärme' || facility.type === 'Elproduktion') &&
              facility?.address?.street === address &&
              agreementsFacilities.some((agreement) => agreement === facility?.facilityId)
          );

          setFacilities(filteredFacilities);
        }
      }
      setIsFiltering(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agreements, address]);

  const thisMonth = dayjs();

  return (
    <section className="pb-80 visible">
      <h1>Aktuell förbrukning och produktion</h1>

      {isUserFetching || isAgreementsFetching || isFiltering ? (
        <Spinner className="mx-auto" />
      ) : user && facilities?.length ? (
        <div>
          <p className="text-large mb-32">
            Visar din förbrukning och produktion för {thisMonth.format('MMMM YYYY').toLowerCase()}.
          </p>
          {user.addresses?.length > 1 && (
            <div className="sm:flex sm:flex-row items-center pb-24 gap-16 block">
              <strong>Adress</strong>
              <Select className="sm:w-auto sm:mt-0 mt-8 w-full" onChange={(e) => setAddress(e.target.value)} size="sm">
                {user.addresses?.map((address) => (
                  <Select.Option key={address?.address ?? 'unknown'}>
                    {address?.address ? address.address : 'Okänd adress'}
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
        <p>Det finns ingen förbrukning att visa.</p>
      )}
    </section>
  );
};
