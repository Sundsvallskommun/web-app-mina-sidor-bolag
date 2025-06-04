'use client';

import { ConsumptionCard } from '@layouts/pages/mypages-sections/overview/consumption/consumption-card.component';
import { Select, Spinner } from '@sk-web-gui/react';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { useEffect, useState } from 'react';
import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';
import dayjs from 'dayjs';

export const Consumption = () => {
  const { data: user, isFetching: isUserFetching } = useApi<User>({
    url: '/me',
    method: 'get',
    queryKey: ['user'],
  });

  const [address, setAddress] = useState<string>();
  const [facilities, setFacilities] = useState<InstalledBaseItem[]>();

  useEffect(() => {
    setAddress(user?.addresses[0].address ?? '');
  }, [user]);

  useEffect(() => {
    if (!isUserFetching) {
      setFacilities(
        user?.facilities.filter(
          (facility) =>
            (facility.type === 'El' || facility.type === 'Fjärrvärme' || facility.type === 'Elproduktion') &&
            facility?.address?.street === address
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <section className="pb-80 visible">
      <h1>Aktuell förbrukning och produktion</h1>
      <p className="text-large mb-32">
        Visar din förbrukning och produktion för {dayjs().format('MMMM YYYY').toLowerCase()}.
      </p>
      {!isUserFetching && user && facilities ? (
        <div>
          {user.addresses.length > 1 && (
            <div className="sm:flex sm:flex-row items-center pb-24 gap-16 block">
              <strong>Adress</strong>
              <Select className="sm:w-auto sm:mt-0 mt-8 w-full" onChange={(e) => setAddress(e.target.value)} size="sm">
                {user.addresses.map((address) => (
                  <Select.Option key={address.address}>
                    {address.address ? address.address : 'Okänd adress'}
                  </Select.Option>
                ))}
              </Select>
            </div>
          )}

          <div className="w-full md:flex md:flex-wrap md:gap-24 block">
            {facilities.map((facility) => {
              return <ConsumptionCard key={facility.facilityId} facility={facility} />;
            })}
          </div>
        </div>
      ) : (
        <Spinner className="mx-auto" />
      )}
    </section>
  );
};
