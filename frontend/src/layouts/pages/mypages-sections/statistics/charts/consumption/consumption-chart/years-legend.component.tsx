import { MergedStatisticsMeasurementData, StatisticsMeasurementData } from '@interfaces/measurement-data';
import { isNormalYear } from '@utils/normal-year';
import dayjs from 'dayjs';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from 'usehooks-ts';

interface YearsLegendProps {
  readonly data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
}

export function YearsLegend({ data }: YearsLegendProps) {
  const { getValues } = useFormContext();
  const { isDarkMode } = useDarkMode();
  const { t } = useTranslation('statistics');

  const year = getValues().year;
  if (!year) return null;

  const normalYear = isNormalYear(year);
  const currentLabel = normalYear
    ? t('statistics:consumption.totalConsumption')
    : dayjs(data?.measurementData?.[0]?.measurementPoints?.[0]?.timestamp).format('YYYY');
  const comparisonLabel = normalYear ? t('statistics:consumption.correctedConsumption') : year;

  return (
    <div
      className={
        normalYear
          ? 'flex flex-col md:flex-row items-start md:items-center md:justify-start gap-8 md:gap-32'
          : 'flex md:justify-start justify-center'
      }
    >
      <div className={`flex items-center md:left ${normalYear ? '' : 'w-90 md:mx-auto'}`}>
        <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <rect
            width="17"
            height="17"
            rx="2"
            ry="2"
            fill={isDarkMode ? '#FAE9E7' : '#600724'}
            stroke={isDarkMode ? '#FAE9E7' : '#600724'}
          />
        </svg>
        <p className="pl-8 whitespace-nowrap">{currentLabel}</p>
      </div>

      <div className={`flex items-center ${normalYear ? '' : 'w-90'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 19 19">
          <rect
            width="17"
            height="17"
            rx="3.5"
            fill={isDarkMode ? '#2F2E2E' : '#FAE9E7'}
            stroke={isDarkMode ? '#FAE9E7' : '#600724'}
          />
        </svg>
        <p className="pl-8 whitespace-nowrap">{comparisonLabel}</p>
      </div>
    </div>
  );
}
