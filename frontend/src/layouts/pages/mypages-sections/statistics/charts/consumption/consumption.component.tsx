import { MergedStatisticsMeasurementData, StatisticsMeasurementData } from '@interfaces/measurement-data';
import { ConsumptionChart } from '@layouts/pages/mypages-sections/statistics/charts/consumption/consumption-chart/consumption-chart.component';
import { YearsLegend } from '@layouts/pages/mypages-sections/statistics/charts/consumption/consumption-chart/years-legend.component';
import ConsumptionInformation from '@layouts/pages/mypages-sections/statistics/charts/consumption/consumption-information.component';
import { MeasurementDataTable } from '@layouts/pages/mypages-sections/statistics/charts/measurement-data-table/measurement-data-table.component';
import { Spinner } from '@sk-web-gui/react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ChartStyleSelector } from '../chart-style-selector.component';
import { TimeIntervalSelector } from '../time-interval-selector.component';
import dayjs from 'dayjs';

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
  isFetching: boolean;
  isPreviousFetching: boolean;
  updateIsHourQuarter?: (isHourQuarter: boolean) => void;
}

export default function Consumption(props: ElectricityConsumptionProps) {
  const { setValue, getValues, watch } = useFormContext();
  const { data, isFetching, isPreviousFetching, updateIsHourQuarter } = props;
  const [viewMode, setViewMode] = useState<EnumViewMode>(EnumViewMode.graph);
  const [timeInterval, setTimeInterval] = useState<EnumTimeInterval>(EnumTimeInterval.hour);
  const { t } = useTranslation('statistics');

  const showTimeInterval =
    dayjs(getValues().toDate).diff(getValues().fromDate, 'days') < 2 && data?.category === 'ELECTRICITY';

  const isHourQuarter = watch('isHourQuarter');

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
      <h4>
        {getValues().category} {data?.formattedDate}
        {getValues().year && !isFetching ? <> och {getValues().year}</> : ''}
      </h4>
      <p data-cy="address">{getValues().address}</p>
      {isFetching || isPreviousFetching ? (
        <Spinner className="mx-auto my-80" />
      ) : data?.measurementData?.[0]?.measurementPoints ? (
        <div>
          <ConsumptionInformation data={data} />

          <div className="md:flex md:mt-56 mt-0 mb-32 md:justify-between">
            {getValues().year && viewMode === EnumViewMode.graph && !getValues().isHourQuarter && (
              <div className="content-center">
                <YearsLegend data={data} />
              </div>
            )}
            {showTimeInterval && (
              <TimeIntervalSelector
                current={timeInterval === EnumTimeInterval.hour ? 0 : 1}
                onChangeCurrent={(current) =>
                  current === 0 ? setTimeInterval(EnumTimeInterval.hour) : setTimeInterval(EnumTimeInterval.quarter)
                }
              />
            )}
            <div className="ml-auto">
              <ChartStyleSelector
                current={viewMode === EnumViewMode.graph ? 0 : 1}
                onChangeCurrent={(current) =>
                  current === 0 ? setViewMode(EnumViewMode.graph) : setViewMode(EnumViewMode.table)
                }
              />
            </div>
          </div>

          {viewMode === EnumViewMode.graph ? (
            <ConsumptionChart data={data} />
          ) : (
            <MeasurementDataTable data={data} isConsumption={true} />
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
