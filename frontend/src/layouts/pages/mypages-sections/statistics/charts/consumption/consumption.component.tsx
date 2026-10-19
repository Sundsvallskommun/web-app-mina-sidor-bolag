import { MergedStatisticsMeasurementData, StatisticsMeasurementData } from '@interfaces/measurement-data';
import { ConsumptionChart } from '@layouts/pages/mypages-sections/statistics/charts/consumption/consumption-chart/consumption-chart.component';
import { canShowTemperature } from '@services/measurement-data-service';
import { YearsLegend } from '@layouts/pages/mypages-sections/statistics/charts/consumption/consumption-chart/years-legend.component';
import ConsumptionInformation from '@layouts/pages/mypages-sections/statistics/charts/consumption/consumption-information.component';
import { MeasurementDataTable } from '@layouts/pages/mypages-sections/statistics/charts/measurement-data-table/measurement-data-table.component';
import { Checkbox, Spinner } from '@sk-web-gui/react';
import { ReactNode, useEffect, useState } from 'react';
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

interface ConsumptionControlsProps {
  showTimeInterval: boolean;
  timeInterval: EnumTimeInterval;
  onTimeIntervalChange: (timeInterval: EnumTimeInterval) => void;
  viewMode: EnumViewMode;
  onViewModeChange: (viewMode: EnumViewMode) => void;
  yearsLegend: ReactNode;
}

function ConsumptionControls(props: Readonly<ConsumptionControlsProps>) {
  const { showTimeInterval, timeInterval, onTimeIntervalChange, viewMode, onViewModeChange, yearsLegend } = props;

  return (
    <div className="flex flex-col gap-40 md:gap-24 mb-32">
      <div className="flex flex-col-reverse gap-40 md:flex-row md:gap-0 md:justify-between md:items-center">
        {showTimeInterval ? (
          <TimeIntervalSelector
            current={timeInterval === EnumTimeInterval.hour ? 0 : 1}
            onChangeCurrent={(current) =>
              onTimeIntervalChange(current === 0 ? EnumTimeInterval.hour : EnumTimeInterval.quarter)
            }
          />
        ) : (
          yearsLegend
        )}
        <div className="md:ml-auto">
          <ChartStyleSelector
            current={viewMode === EnumViewMode.graph ? 0 : 1}
            onChangeCurrent={(current) => onViewModeChange(current === 0 ? EnumViewMode.graph : EnumViewMode.table)}
          />
        </div>
      </div>
      {showTimeInterval && yearsLegend}
    </div>
  );
}

interface ConsumptionViewProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData;
  viewMode: EnumViewMode;
  showTemperature: boolean;
  onShowTemperatureChange: (showTemperature: boolean) => void;
}

function ConsumptionView(props: Readonly<ConsumptionViewProps>) {
  const { data, viewMode, showTemperature, onShowTemperatureChange } = props;
  const { t } = useTranslation('statistics');

  return (
    <div className="flex flex-col gap-24">
      {viewMode === EnumViewMode.graph ? (
        <ConsumptionChart data={data} showTemperature={showTemperature} />
      ) : (
        <MeasurementDataTable data={data} showTemperature={showTemperature} />
      )}
      {canShowTemperature(data) && (
        <Checkbox
          checked={showTemperature}
          onChange={(e) => onShowTemperatureChange(e.target.checked)}
          data-cy="show-temperature-checkbox"
        >
          {t('statistics:temperature.show')}
        </Checkbox>
      )}
    </div>
  );
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
  const yearsLegend = showYearsLegend && (
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
    updateIsHourQuarter?.(timeInterval === EnumTimeInterval.quarter);
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

          <ConsumptionControls
            showTimeInterval={showTimeInterval}
            timeInterval={timeInterval}
            onTimeIntervalChange={setTimeInterval}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            yearsLegend={yearsLegend}
          />

          <ConsumptionView
            data={data}
            viewMode={viewMode}
            showTemperature={showTemperature}
            onShowTemperatureChange={setShowTemperature}
          />
        </div>
      ) : (
        <div data-cy="empty-response-container" className="w-full text-center my-56">
          <p className="font-bold">{t('statistics:noData')}</p>
        </div>
      )}
    </div>
  );
}
