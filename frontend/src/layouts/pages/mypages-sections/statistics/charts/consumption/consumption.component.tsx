import { MergedStatisticsMeasurementData, StatisticsMeasurementData } from '@interfaces/measurement-data';
import { ConsumptionChart } from '@layouts/pages/mypages-sections/statistics/charts/consumption/consumption-chart/consumption-chart.component';
import { canShowTemperature } from '@services/measurement-data-service';
import { YearsLegend } from '@layouts/pages/mypages-sections/statistics/charts/consumption/consumption-chart/years-legend.component';
import ConsumptionInformation from '@layouts/pages/mypages-sections/statistics/charts/consumption/consumption-information.component';
import { MeasurementDataTable } from '@layouts/pages/mypages-sections/statistics/charts/measurement-data-table/measurement-data-table.component';
import { Checkbox, Spinner } from '@sk-web-gui/react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ChartStyleSelector } from '../chart-style-selector.component';
import { TimeIntervalSelector } from '../time-interval-selector.component';
import dayjs from 'dayjs';
import { isNormalYear } from '@utils/normal-year';

enum EnumViewMode {
  graph = 'graph',
  table = 'table',
}
enum EnumTimeInterval {
  hour = 'hour',
  quarter = 'quarter',
}

export interface ElectricityConsumptionProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
  addresses: string[];
  isFetching: boolean;
  isPreviousFetching: boolean;
  updateIsHourQuarter?: (isHourQuarter: boolean) => void;
}

export default function Consumption(props: ElectricityConsumptionProps) {
  const { setValue, getValues, watch } = useFormContext();
  const { data, addresses, isFetching, isPreviousFetching, updateIsHourQuarter } = props;
  const [viewMode, setViewMode] = useState<EnumViewMode>(EnumViewMode.graph);
  const [timeInterval, setTimeInterval] = useState<EnumTimeInterval>(EnumTimeInterval.hour);
  const [showTemperature, setShowTemperature] = useState(false);
  const { t } = useTranslation('statistics');

  const showTimeInterval =
    dayjs(getValues().toDate).diff(getValues().fromDate, 'days') < 2 && data?.category === 'ELECTRICITY';

  const isHourQuarter = watch('isHourQuarter');

  const showYearsLegend = !!getValues().year && viewMode === EnumViewMode.graph && !getValues().isHourQuarter;
  const yearsLegend = (
    <div className="content-center">
      <YearsLegend data={data} showTemperature={showTemperature && canShowTemperature(data)} />
    </div>
  );

  useEffect(() => {
    const expected = isHourQuarter ? EnumTimeInterval.quarter : EnumTimeInterval.hour;
    if (timeInterval !== expected) {
      setTimeInterval(expected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHourQuarter]);

  useEffect(() => {
    if (updateIsHourQuarter) {
      updateIsHourQuarter(timeInterval === EnumTimeInterval.quarter);
    }

    setValue('isHourQuarter', timeInterval === EnumTimeInterval.quarter);
  }, [timeInterval, updateIsHourQuarter, setValue]);

  return (
    <div>
      <h4 className="sm:block hidden">
        {getValues().facilityType} {data?.formattedDate}
        {getValues().year && !isNormalYear(getValues().year) && !isFetching ? <> och {getValues().year}</> : ''}
      </h4>
      <p className="sm:block hidden" data-cy="address">
        {addresses.join(', ')}
      </p>
      {isFetching || isPreviousFetching ? (
        <Spinner className="mx-auto my-80" />
      ) : data?.measurementData?.[0]?.measurementPoints ? (
        <div className="flex flex-col gap-56">
          <ConsumptionInformation data={data} />

          <div className="flex flex-col gap-40 md:gap-24 mb-32">
            <div className="flex flex-col-reverse gap-40 md:flex-row md:gap-0 md:justify-between md:items-center">
              {showTimeInterval ? (
                <TimeIntervalSelector
                  current={timeInterval === EnumTimeInterval.hour ? 0 : 1}
                  onChangeCurrent={(current) =>
                    current === 0 ? setTimeInterval(EnumTimeInterval.hour) : setTimeInterval(EnumTimeInterval.quarter)
                  }
                />
              ) : (
                showYearsLegend && yearsLegend
              )}
              <div className="md:ml-auto">
                <ChartStyleSelector
                  current={viewMode === EnumViewMode.graph ? 0 : 1}
                  onChangeCurrent={(current) =>
                    current === 0 ? setViewMode(EnumViewMode.graph) : setViewMode(EnumViewMode.table)
                  }
                />
              </div>
            </div>
            {showYearsLegend && showTimeInterval && yearsLegend}
          </div>

          {viewMode === EnumViewMode.graph ? (
            <div className="flex flex-col gap-24">
              <ConsumptionChart data={data} showTemperature={showTemperature} />
              {canShowTemperature(data) && (
                <Checkbox
                  checked={showTemperature}
                  onChange={(e) => setShowTemperature(e.target.checked)}
                  data-cy="show-temperature-checkbox"
                >
                  {t('statistics:temperature.show')}
                </Checkbox>
              )}
            </div>
          ) : (
            <MeasurementDataTable data={data} />
          )}
        </div>
      ) : (
        <div data-cy="empty-response-container" className="w-full text-center my-56">
          <p className="font-bold">{t('statistics:noData')}</p>
        </div>
      )}
    </div>
  );
}
