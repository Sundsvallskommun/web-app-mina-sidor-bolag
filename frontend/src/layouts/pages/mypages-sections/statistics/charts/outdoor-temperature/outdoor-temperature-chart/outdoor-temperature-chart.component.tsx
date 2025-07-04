'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CustomTooltip from '@layouts/pages/mypages-sections/statistics/charts/custom-tooltip.component';
import { useFormContext } from 'react-hook-form';
import { MergedStatisticsMeasurementData, StatisticsMeasurementData } from '@interfaces/measurement-data';
import { useDarkMode, useMediaQuery } from 'usehooks-ts';

export interface OutdoorTemperatureChartProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
}

export const OutdoorTemperatureChart = (props: OutdoorTemperatureChartProps) => {
  const isLargeDevice = useMediaQuery('(min-width: 480px)');
  const { isDarkMode } = useDarkMode();

  const { getValues } = useFormContext();
  const { data } = props;

  return (
    data?.temperatureData && (
      <div style={{ maxWidth: 1000, height: 500 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={1000}
            height={500}
            data={data.temperatureData[0].measurementPoints}
            margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <XAxis
              interval="preserveStartEnd"
              dy={10}
              height={50}
              axisLine={false}
              tickLine={false}
              dataKey="chartTimestamp"
              tick={{ fill: isDarkMode ? '#FFFFFF' : '#444450' }}
            />
            {isLargeDevice && (
              <YAxis
                dx={-30}
                width={40} 
                textAnchor="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDarkMode ? '#FFFFFF' : '#444450' }}
              />
            )}
            <Tooltip
              content={
                <CustomTooltip
                  fromDate={getValues().fromDate}
                  year={getValues().year}
                  isConsumption={false}
                  active={undefined}
                  payload={undefined}
                  label={undefined}
                  aggregatedOn={data?.aggregatedOn}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={isDarkMode ? '#FAE9E7' : '#600724'}
              strokeWidth={2}
              dot={false}
            />
            {getValues().year && (
              <Line
                type="monotone"
                dataKey="previousValue"
                stroke={isDarkMode ? '#B5CFE3' : '#005595'}
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  );
};
