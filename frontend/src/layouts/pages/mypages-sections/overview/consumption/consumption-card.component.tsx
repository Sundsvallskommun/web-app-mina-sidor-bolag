'use client';

import { Icon, Spinner } from '@sk-web-gui/react';
import { useApi } from '@services/api-service';
import {
  calculateYearDifference,
  getCategoryFromInstalledBaseType,
  measurementDataByMonthHandler,
} from '@services/measurement-data-service';
import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';
import { ArrowDownRight, ArrowUpRight, Lightbulb, Waves } from 'lucide-react';
import dayjs from 'dayjs';

export const ConsumptionCard = (props: { facility: InstalledBaseItem }) => {
  const { facility } = props;

  const getParams = (current: boolean) => {
    const params = new URLSearchParams({});
    const date = new Date();

    const firstDay = new Date(
      current ? date.getFullYear() : date.getFullYear() - 1,
      date.getMonth(),
      2,
      1,
      0,
      0
    ).toISOString();

    const lastDay = new Date(
      current ? date.getFullYear() : date.getFullYear() - 1,
      date.getMonth() + 1,
      0,
      24,
      59,
      59
    ).toISOString();

    params.append('category', getCategoryFromInstalledBaseType(facility.type));
    params.append('facilityId', facility.facilityId ?? '');
    params.append('fromDate', firstDay.toString());
    params.append('toDate', lastDay.toString());
    params.append('aggregateOn', 'DAY');

    return params.toString();
  };

  const { data: currentYear, isFetching: isCurrentFetching } = useApi({
    url: `/measurementdata?${getParams(true)}`,
    method: 'get',
    dataHandler: measurementDataByMonthHandler,
    queryKey: ['currentYear', facility.facilityId, getParams(true)],
  });

  const { data: previousYear, isFetching: isPreviousFetching } = useApi({
    url: `/measurementdata?${getParams(false)}`,
    method: 'get',
    dataHandler: measurementDataByMonthHandler,
    queryKey: ['previousYear', facility.facilityId, getParams(false)],
  });

  const yearDifference = () => {
    const diff = calculateYearDifference(currentYear, previousYear);

    return (
      <>
        {diff ? (
          <div className="flex pt-16">
            {diff <= 0.99 ? (
              <p className="flex items-center text-small pr-4">
                <Icon icon={<ArrowUpRight />} size={20} color="error" />
                <strong className="text-error">+{diff.toString().slice(1)}% </strong>
              </p>
            ) : (
              <p className="flex text-small pr-4">
                <Icon icon={<ArrowDownRight />} size={20} color="gronsta" />
                <strong className="text-gronsta-text">-{diff}% </strong>
              </p>
            )}
            <p className="text-small">
              jämfört med {dayjs().subtract(1, 'year').format('MMMM YYYY').toLowerCase()} ({previousYear} kWh)
            </p>
          </div>
        ) : (
          <p className="text-small pt-16">Det finns ingen data att visa från föregående år</p>
        )}
      </>
    );
  };

  const translateTypeIcon = (type: string) => {
    return type === 'Fjärrvärme' ? <Waves className="rotate-90" /> : <Lightbulb />;
  };

  return (
    <article className="grow max-w-[520px] bg-background-content shadow-50 rounded-cards p-16 lg:my-0 mb-24">
      <>
        <div className="flex gap-12 pb-16">
          <div className="flex items-center">
            <div className={`bg-vattjom-background-200 flex justify-center items-center h-32 w-32 p-4 rounded-button`}>
              <Icon icon={translateTypeIcon(facility.type ? facility.type : '')} size={20} />
            </div>
          </div>
          <p className="text-large">{facility.type}</p>
        </div>

        {isCurrentFetching || isPreviousFetching ? (
          <Spinner className="mx-auto py-42" />
        ) : (
          <div>
            <h2>{currentYear ? currentYear : 0} kWh</h2>
            {yearDifference()}
          </div>
        )}
      </>
    </article>
  );
};
