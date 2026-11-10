import { MergedStatisticsMeasurementData, StatisticsMeasurementData } from '@interfaces/measurement-data';
import { chartColors } from '@utils/chart-colors.const';
import { isNormalYear } from '@utils/normal-year';
import dayjs from 'dayjs';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from 'usehooks-ts';

interface YearsLegendProps {
  readonly data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
  readonly showTemperature?: boolean;
}

interface TemperatureLegendItemProps {
  readonly label: string;
  readonly color: string;
  readonly dashed?: boolean;
}

const TemperatureLegendItem = ({ label, color, dashed }: TemperatureLegendItemProps) => (
  <div className="flex items-center">
    <svg width="24" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <line
        x1="0"
        y1="10"
        x2="24"
        y2="10"
        stroke={color}
        strokeWidth="2"
        strokeDasharray={dashed ? '5 5' : undefined}
      />
    </svg>
    <p className="pl-8 whitespace-nowrap">{label}</p>
  </div>
);

export function YearsLegend({ data, showTemperature = false }: YearsLegendProps) {
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
  const currentBarColor = isDarkMode ? chartColors.singleBar.dark : chartColors.singleBar.light;
  const previousBarColor = isDarkMode ? chartColors.previousValue.dark : chartColors.previousValue.light;
  const temperatureColor = isDarkMode ? chartColors.temperature.dark : chartColors.temperature.light;
  const temperatureTitle = t('statistics:temperature.title');

  return (
    <div className="flex flex-col gap-8">
      <div
        className={
          normalYear
            ? 'flex flex-col md:flex-row items-start md:items-center md:justify-start gap-8 md:gap-32'
            : 'flex md:justify-start justify-center'
        }
      >
        <div className={`flex items-center md:left ${normalYear ? '' : 'w-90'}`}>
          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <rect width="17" height="17" rx="2" ry="2" fill={currentBarColor.fill} stroke={currentBarColor.stroke} />
          </svg>
          <p className="pl-8 whitespace-nowrap">{currentLabel}</p>
        </div>

        <div className={`flex items-center ${normalYear ? '' : 'w-90'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 19 19">
            <rect width="17" height="17" rx="3.5" fill={previousBarColor.fill} stroke={previousBarColor.stroke} />
          </svg>
          <p className="pl-8 whitespace-nowrap">{comparisonLabel}</p>
        </div>
      </div>

      {showTemperature && (
        <div className="flex flex-wrap md:justify-start justify-center gap-x-32 gap-y-8">
          {normalYear ? (
            <TemperatureLegendItem label={temperatureTitle} color={temperatureColor} />
          ) : (
            <>
              <TemperatureLegendItem label={`${temperatureTitle} ${currentLabel}`} color={temperatureColor} />
              <TemperatureLegendItem label={`${temperatureTitle} ${comparisonLabel}`} color={temperatureColor} dashed />
            </>
          )}
        </div>
      )}
    </div>
  );
}
