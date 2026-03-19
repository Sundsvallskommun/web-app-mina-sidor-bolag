import { MergedStatisticsMeasurementData, StatisticsMeasurementData } from '@interfaces/measurement-data';
import { OutdoorTemperatureChart } from '@layouts/pages/mypages-sections/statistics/charts/outdoor-temperature/outdoor-temperature-chart/outdoor-temperature-chart.component';
import { Divider, Spinner } from '@sk-web-gui/react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { MeasurementDataTable } from '@layouts/pages/mypages-sections/statistics/charts/measurement-data-table/measurement-data-table.component';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { ChartStyleSelector } from '../chart-style-selector.component';

export interface OutdoorTemperatureProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
  isFetching: boolean;
  isPreviousFetching: boolean;
}

export default function OutdoorTemperature(props: OutdoorTemperatureProps) {
  const { data, isFetching, isPreviousFetching } = props;
  const [current, setCurrent] = useState<number>(0);
  const { getValues } = useFormContext();
  const { t } = useTranslation('statistics');

  return (
    data?.temperatureData && (
      <div className="mb-56">
        <h4>{t('statistics:temperature.title')}</h4>
        <p className="capitalize">{getValues().area}</p>

        {isFetching || isPreviousFetching ? (
          <Spinner className="mx-auto" />
        ) : (
          <div className="md:mt-56 mt-0">
            <div className="md:flex mb-56 md:justify-between">
              <div className="content-center">
                {getValues().year && current === 0 && (
                  <div className="flex md:justify-start justify-center justify-items-center">
                    <div className="flex w-90 items-center md:left">
                      <Divider className="max-w-30 border-2 border-[#600724] dark:border-[#FAE9E7]" />
                      <p className="pl-16">
                        {dayjs(data?.measurementData?.[0]?.measurementPoints?.[0]?.timestamp).format('YYYY')}
                      </p>
                    </div>

                    <div className="flex w-90 items-center ml-16">
                      <Divider className="max-w-30 border-2 border-[#005595] dark:border-[#B5CFE3] border-dashed" />
                      <p className="pl-16"> {getValues().year}</p>
                    </div>
                  </div>
                )}
              </div>

              <ChartStyleSelector current={current} onChangeCurrent={setCurrent} />
            </div>

            {current === 0 ? (
              <OutdoorTemperatureChart data={data} />
            ) : (
              <MeasurementDataTable data={data} isConsumption={false} />
            )}
          </div>
        )}
      </div>
    )
  );
}
