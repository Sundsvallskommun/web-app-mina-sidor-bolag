import { MergedStatisticsMeasurementData, StatisticsMeasurementData } from '@interfaces/measurement-data';
import { ConsumptionChart } from '@layouts/pages/mypages-sections/statistics/charts/consumption/consumption-chart/consumption-chart.component';
import ConsumptionInformation from '@layouts/pages/mypages-sections/statistics/charts/consumption/consumption-information.component';
import { MeasurementDataTable } from '@layouts/pages/mypages-sections/statistics/charts/measurement-data-table/measurement-data-table.component';
import { Spinner } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from 'usehooks-ts';
import { ChartStyleSelector } from '../chart-style-selector.component';

export interface ElectricityConsumptionProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
  isFetching: boolean;
  isPreviousFetching: boolean;
}

export default function Consumption(props: ElectricityConsumptionProps) {
  const { data, isFetching, isPreviousFetching } = props;
  const [current, setCurrent] = useState<number>(0);
  const { getValues } = useFormContext();
  const { isDarkMode } = useDarkMode();
  const { t } = useTranslation('statistics');

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
            <div className="content-center">
              {getValues().year && current === 0 && (
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
                    <p className="pl-8">
                      {dayjs(data?.measurementData?.[0].measurementPoints?.[0].timestamp).format('YYYY')}
                    </p>
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
              )}
            </div>

            <ChartStyleSelector current={current} onChangeCurrent={setCurrent} />
          </div>

          {current === 0 ? <ConsumptionChart data={data} /> : <MeasurementDataTable data={data} isConsumption={true} />}
        </div>
      ) : (
        <div data-cy="empty-response-container" className="w-full text-center my-56">
          <p className="font-bold">{t('statistics:noData')}</p>
        </div>
      )}
    </div>
  );
}
