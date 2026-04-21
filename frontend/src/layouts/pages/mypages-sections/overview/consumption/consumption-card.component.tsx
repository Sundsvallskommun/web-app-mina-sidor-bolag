'use client';

import { Icon, Spinner } from '@sk-web-gui/react';
import { useApi } from '@services/api-service';
import { calculateYearDifference, measurementDataByMonthHandler } from '@services/measurement-data-service';
import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';
import { ArrowDownRight, ArrowUpRight, Lightbulb, Waves } from 'lucide-react';
import { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { getCategoryFromInstalledBaseType } from '@utils/facility';

export const ConsumptionCard = (props: { facility: InstalledBaseItem; date: Dayjs }) => {
  const { facility, date } = props;
  const { t } = useTranslation('overview');

  const getParams = () => {
    const params = new URLSearchParams({});

    // Fetch 13 months of data so that we can compare the current month with the same month last year
    const firstDay = date.subtract(1, 'year').startOf('month').toISOString();
    const lastDay = date.endOf('month').toISOString();

    params.append('category', getCategoryFromInstalledBaseType(facility.type));
    params.append('facilityIds', facility.facilityId ?? '');
    params.append('fromDate', firstDay);
    params.append('toDate', lastDay);
    params.append('aggregateOn', 'MONTH');

    return params.toString();
  };

  const { data: measurementData, isFetching: isCurrentFetching } = useApi({
    url: `/measurementdata?${getParams()}`,
    method: 'get',
    dataHandler: measurementDataByMonthHandler(date),
    queryKey: ['currentYear', facility.facilityId, getParams()],
  });

  const yearDifference = () => {
    const diff = calculateYearDifference(measurementData?.current, measurementData?.previous);

    return (
      <>
        {typeof diff === 'number' && (
          <div className="flex items-start pt-16">
            {diff === 0 ? (
              <p className="flex items-center text-small pr-4">
                <strong className="text-vattjom-text">
                  {t('overview:consumption.card.diff', { diff: diff.toString() })}
                </strong>
              </p>
            ) : diff <= 0.99 ? (
              <p className="flex items-center text-small pr-4">
                <Icon icon={<ArrowUpRight />} size={20} color="error" />
                <strong className="text-error">
                  {t('overview:consumption.card.positiveDiff', { diff: diff.toString() })}
                </strong>
              </p>
            ) : (
              <p className="flex text-small pr-4">
                <Icon icon={<ArrowDownRight />} size={20} color="gronsta" />
                <strong className="text-gronsta-text">
                  {t('overview:consumption.card.negativeDiff', { diff: diff.toString() })}
                </strong>
              </p>
            )}
            <p className="text-small">
              {t('overview:consumption.card.comparison', {
                date: date.subtract(1, 'year').format('MMMM YYYY').toLowerCase(),
                consumption: measurementData?.previous ?? 0,
              })}
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
    <article
      className="grow md:min-w-[338px] max-w-[520px] min-h-[165px] bg-background-content shadow-50 rounded-cards p-16 lg:my-0 mb-24"
      data-cy={`${facility.facilityId}`}
    >
      <div className="flex gap-12 pb-16">
        <div className="flex items-center">
          <div className={`bg-vattjom-background-200 flex justify-center items-center h-32 w-32 p-4 rounded-button`}>
            <Icon icon={translateTypeIcon(facility.type ?? '')} size={20} />
          </div>
        </div>
        <p className="text-large">{facility.type === 'El' ? 'Elförbrukning' : (facility.type ?? '')}</p>
      </div>

      {isCurrentFetching ? (
        <Spinner className="mx-auto py-42" />
      ) : (
        <div>
          {measurementData?.current ? (
            <h2>{measurementData.current + t('overview:consumption.card.unit')}</h2>
          ) : (
            <p className="text-small">{t('overview:consumption.card.noData')}</p>
          )}
          {yearDifference()}
        </div>
      )}
    </article>
  );
};
