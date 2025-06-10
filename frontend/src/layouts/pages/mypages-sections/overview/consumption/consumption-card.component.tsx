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

  const getParams = () => {
    const params = new URLSearchParams({});
    const date = new Date();

    const firstDay = new Date(date.getFullYear() - 1, date.getMonth(), 1, 1, 0, 0).toISOString();
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 24, 59, 59).toISOString();

    params.append('category', getCategoryFromInstalledBaseType(facility.type));
    params.append('facilityId', facility.facilityId ?? '');
    params.append('fromDate', firstDay.toString());
    params.append('toDate', lastDay.toString());
    params.append('aggregateOn', 'MONTH');

    return params.toString();
  };

  const { data: measurementData, isFetching: isCurrentFetching } = useApi({
    url: `/measurementdata?${getParams()}`,
    method: 'get',
    dataHandler: measurementDataByMonthHandler,
    queryKey: ['currentYear', facility.facilityId, getParams()],
  });

  const yearDifference = () => {
    const diff = calculateYearDifference(measurementData?.current, measurementData?.previous);

    return (
      <>
        {diff && (
          <div className="flex items-start pt-16">
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
              jämfört med {dayjs().subtract(1, 'year').format('MMMM YYYY').toLowerCase()} (
              {measurementData?.previous ?? 0} kWh)
            </p>
          </div>
        )}
      </>
    );
  };

  const translateTypeIcon = (type: string) => {
    return type === 'Fjärrvärme' ? <Waves className="rotate-90" /> : <Lightbulb />;
  };

  return (
    <article className="grow md:min-w-[338px] max-w-[520px] min-h-[165px] bg-background-content shadow-50 rounded-cards p-16 lg:my-0 mb-24">
      <div className="flex gap-12 pb-16">
        <div className="flex items-center">
          <div className={`bg-vattjom-background-200 flex justify-center items-center h-32 w-32 p-4 rounded-button`}>
            <Icon icon={translateTypeIcon(facility.type ?? '')} size={20} />
          </div>
        </div>
        <p className="text-large">{facility.type}</p>
      </div>

      {isCurrentFetching ? (
        <Spinner className="mx-auto py-42" />
      ) : (
        <div>
          {measurementData?.current ? (
            <h2>{measurementData.current + 'kWh'}</h2>
          ) : (
            <p className="text-small">Det går inte att hitta någon data för perioden.</p>
          )}
          {yearDifference()}
        </div>
      )}
    </article>
  );
};
