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
import { useMediaQuery } from 'usehooks-ts';

export interface ConsumptionChartProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
}

export const ConsumptionChart = (props: ConsumptionChartProps) => {
  const isLargeDevice = useMediaQuery('(min-width: 500px)');
  const { getValues } = useFormContext();
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
      <div style={{ maxWidth: 1000, height: 500 }}>
        <ResponsiveContainer width="100%" height="100%" className="my-56">
          <BarChart
            width={1000}
            height={500}
            data={data.measurementData[0]?.measurementPoints}
            margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <XAxis interval="preserveStartEnd" axisLine={false} tickLine={false} dataKey="chartTimestamp" />
            {isLargeDevice && (
              <YAxis axisLine={false} tickLine={false} dataKey="value" domain={[0, setYAxisDomain()]} />
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
            <Bar dataKey="value" fill="#1E3158" radius={[4, 4, 0, 0]} stroke="#1E3158" strokeWidth="1" />
            {getValues().year && (
              <Bar dataKey="previousValue" fill="#FAFAFA" radius={[4, 4, 0, 0]} stroke="#005595" strokeWidth="1" />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  );
};
