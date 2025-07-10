'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CustomTooltip from '@layouts/pages/mypages-sections/statistics/charts/custom-tooltip.component';
import { useFormContext } from 'react-hook-form';
import {
  MergedMeasurementPoints,
  MergedStatisticsMeasurementData,
  StatisticsMeasurementData,
} from '@interfaces/measurement-data';
import React from 'react';
import { useDarkMode, useMediaQuery } from 'usehooks-ts';

export interface ConsumptionChartProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
}

export const ConsumptionChart = (props: ConsumptionChartProps) => {
  const isLargeDevice = useMediaQuery('(min-width: 480px)');
  const { getValues } = useFormContext();
  const { isDarkMode } = useDarkMode();
  const { data } = props;

  const setYAxisDomain: () => number = () => {
    if (data) {
      const values: number[] = data?.measurementData?.[0]?.measurementPoints?.map(
        (measurement: MergedMeasurementPoints) => measurement.value
      ) ?? [0];
      const previousValues: number[] = data?.measurementData?.[0]?.measurementPoints?.map(
        (measurement: MergedMeasurementPoints) => (measurement?.previousValue > 0 ? measurement.previousValue : 0)
      ) ?? [0];

      return Math.ceil(Math.max(...values, ...previousValues) / 100) * 100;
    } else {
      return 0;
    }
  };

  return (
    data?.measurementData && (
      <div className="relative" style={{ maxWidth: 1000, height: 500 }}>
        <span className="absolute bottom-[100%] left-0 hidden sm:block">
          <strong>kWh</strong>
        </span>
        <ResponsiveContainer width="100%" height="100%" className="my-56">
          <BarChart
            width={1000}
            height={500}
            data={data.measurementData[0]?.measurementPoints}
            margin={{
              top: 0,
              right: 0,
              left: 4,
              bottom: 4,
            }}
          >
            <XAxis
              interval="preserveStartEnd"
              axisLine={false}
              tickLine={false}
              dataKey="chartTimestamp"
              tick={{ fill: isDarkMode ? '#FFFFFF' : '#444450' }}
            />
            {isLargeDevice && (
              <YAxis
                dx={-50}
                textAnchor="left"
                axisLine={false}
                tickLine={false}
                dataKey="value"
                domain={[0, setYAxisDomain()]}
                tick={{ fill: isDarkMode ? '#FFFFFF' : '#444450' }}
              />
            )}
            <Tooltip
              content={
                <CustomTooltip
                  fromDate={getValues().fromDate}
                  year={getValues().year}
                  isConsumption={true}
                  aggregatedOn={data?.aggregatedOn}
                  active={undefined}
                  payload={undefined}
                  label={undefined}
                />
              }
            />
            <Bar
              className="dark:bg-background-content"
              dataKey="value"
              fill={isDarkMode ? '#FAE9E7' : '#600724'}
              radius={[4, 4, 0, 0]}
              stroke={isDarkMode ? '#FAE9E7' : '#600724'}
              strokeWidth="1"
            />
            {getValues().year && (
              <Bar
                dataKey="previousValue"
                fill={isDarkMode ? '#2F2E2E' : '#FAE9E7'}
                radius={[4, 4, 0, 0]}
                stroke={isDarkMode ? '#FAE9E7' : '#600724'}
                strokeWidth="1"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  );
};
