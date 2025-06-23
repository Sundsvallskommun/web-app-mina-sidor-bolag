'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CustomTooltip from '@layouts/pages/mypages-sections/statistics/charts/custom-tooltip.component';
import { useFormContext } from 'react-hook-form';
import { MergedStatisticsMeasurementData, StatisticsMeasurementData } from '@interfaces/measurement-data';
import React from 'react';

export interface ConsumptionChartProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
}

export const ConsumptionChart = (props: ConsumptionChartProps) => {
  const { getValues } = useFormContext();
  const { data } = props;

  return (
    data &&
    data.measurementData && (
      <ResponsiveContainer className="my-56">
        <div>
          <p className="font-bold">kWh</p>
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
            <XAxis axisLine={false} tickLine={false} dataKey="chartTimestamp" />
            <YAxis orientation="left" textAnchor="end" axisLine={false} tickLine={false} dataKey="value" />
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
              <Bar
                dataKey="previousValue"
                fill="#FAFAFA"
                radius={[4, 4, 0, 0]}
                barSize={getValues().year ? 8 : 14}
                stroke="#005595"
                strokeWidth="1"
              />
            )}
          </BarChart>
        </div>
      </ResponsiveContainer>
    )
  );
};
