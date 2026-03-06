import { MergedStatisticsMeasurementData, StatisticsMeasurementData } from '@interfaces/measurement-data';
import dayjs from 'dayjs';
import { useFormContext } from 'react-hook-form';
import { useDarkMode } from 'usehooks-ts';

interface YearsLegendProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
}

export function YearsLegend({ data }: YearsLegendProps) {
  const { getValues } = useFormContext();
  const { isDarkMode } = useDarkMode();

  if (!getValues().year) return null;

  return (
    <div className="flex md:justify-start justify-center">
      <div className="flex w-90 md:mx-auto items-center md:left">
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
        <p className="pl-8">{dayjs(data?.measurementData?.[0].measurementPoints?.[0].timestamp).format('YYYY')}</p>
      </div>

      <div className="flex w-90 items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 19 19">
          <rect
            width="17"
            height="17"
            rx="3.5"
            fill={isDarkMode ? '#2F2E2E' : '#FAE9E7'}
            stroke={isDarkMode ? '#FAE9E7' : '#600724'}
          />
        </svg>
        <p className="pl-8">{getValues().year}</p>
      </div>
    </div>
  );
}
