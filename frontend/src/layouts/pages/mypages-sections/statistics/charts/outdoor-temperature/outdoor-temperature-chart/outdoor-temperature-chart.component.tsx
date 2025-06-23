'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CustomTooltip from '@layouts/pages/mypages-sections/statistics/charts/custom-tooltip.component';
import { useFormContext } from 'react-hook-form';
import { MergedStatisticsMeasurementData, StatisticsMeasurementData } from '@interfaces/measurement-data';

export interface OutdoorTemperatureChartProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
}

export const OutdoorTemperatureChart = (props: OutdoorTemperatureChartProps) => {
  const { getValues } = useFormContext();
  const { data } = props;

  return (
    data?.temperatureData && (
      <ResponsiveContainer width="100%">
        <div>
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
            <XAxis dy={10} height={50} axisLine={false} tickLine={false} dataKey="chartTimestamp" />
            <YAxis axisLine={false} tickLine={false} />
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
            <Line type="monotone" dataKey="value" stroke="#004070" strokeWidth={2} dot={false} />
            {getValues().year && (
              <Line
                type="monotone"
                dataKey="previousValue"
                stroke="#A90074"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </div>
      </ResponsiveContainer>
    )
  );
};
