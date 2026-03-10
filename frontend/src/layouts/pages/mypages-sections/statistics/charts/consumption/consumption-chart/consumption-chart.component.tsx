'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CustomTooltip from '@layouts/pages/mypages-sections/statistics/charts/custom-tooltip.component';
import { useFormContext } from 'react-hook-form';
import { MergedStatisticsMeasurementData, StatisticsMeasurementData } from '@interfaces/measurement-data';
import React from 'react';
import { useDarkMode, useMediaQuery } from 'usehooks-ts';
import { BarShapeHashed, StackBar } from '@components/stackbar';
import { chartColors } from '@utils/chart-colors.const';

export interface ConsumptionChartProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
}

const calculateYAxisDomain = (dataMax: number) => {
  if (dataMax > 0 && dataMax < 10) {
    return Math.floor(dataMax) + 2;
  }
  if (dataMax > 10 && dataMax < 100) {
    return (Math.floor(dataMax / 10) + 1) * 10;
  }
  if (dataMax > 100 && dataMax < 1000) {
    return (Math.floor(dataMax / 100) + 1) * 100;
  }
  return (Math.floor(dataMax / 1000) + 1) * 1000;
};

interface SingleBarProps {
  isDarkMode: boolean;
}

const SingleBar = ({ isDarkMode }: SingleBarProps) => (
  <Bar
    className="dark:bg-background-content"
    dataKey="value"
    fill={isDarkMode ? chartColors.singleBar.dark.fill : chartColors.singleBar.light.fill}
    radius={2}
    stroke={isDarkMode ? chartColors.singleBar.dark.stroke : chartColors.singleBar.light.stroke}
    strokeWidth="1"
  />
);

interface QuarterlyBarsProps {
  isDarkMode: boolean;
}

const QuarterlyBars = ({ isDarkMode }: QuarterlyBarsProps) => (
  <StackBar radius={2} barSize={14} gap={6} className="dark:bg-background-content">
    <Bar dataKey="values[0]" fill={isDarkMode ? chartColors.stackBar.dark[0] : chartColors.stackBar.light[0]} />
    <Bar
      dataKey="values[1]"
      fill={isDarkMode ? chartColors.stackBar.dark[1] : chartColors.stackBar.light[1]}
      shape={<BarShapeHashed stroke={isDarkMode ? chartColors.hashBar.borderDark : chartColors.hashBar.borderLight} />}
    />
    <Bar dataKey="values[2]" fill={isDarkMode ? chartColors.stackBar.dark[2] : chartColors.stackBar.light[2]} />
    <Bar
      dataKey="values[3]"
      fill={isDarkMode ? chartColors.stackBar.dark[3] : chartColors.stackBar.light[3]}
      stroke={isDarkMode ? chartColors.stackBar.borderDark : chartColors.stackBar.borderLight}
      strokeWidth="1"
    />
  </StackBar>
);

interface PreviousValueBarProps {
  isDarkMode: boolean;
}

const PreviousValueBar = ({ isDarkMode }: PreviousValueBarProps) => (
  <Bar
    dataKey="previousValue"
    fill={isDarkMode ? chartColors.previousValue.dark.fill : chartColors.previousValue.light.fill}
    radius={[4, 4, 0, 0]}
    stroke={isDarkMode ? chartColors.previousValue.dark.stroke : chartColors.previousValue.light.stroke}
    strokeWidth="1"
  />
);

interface BarSeriesProps {
  aggregatedOn?: string;
  isDarkMode: boolean;
  showPreviousYear: boolean;
}

const BarSeries = ({ aggregatedOn, isDarkMode, showPreviousYear }: BarSeriesProps) => (
  <>
    {aggregatedOn === 'QUARTER' ? <QuarterlyBars isDarkMode={isDarkMode} /> : <SingleBar isDarkMode={isDarkMode} />}
    {showPreviousYear && <PreviousValueBar isDarkMode={isDarkMode} />}
  </>
);

export const ConsumptionChart = (props: ConsumptionChartProps) => {
  const isLargeDevice = useMediaQuery('(min-width: 480px)');
  const { getValues } = useFormContext();
  const { isDarkMode } = useDarkMode();
  const { data } = props;

  if (!data?.measurementData) {
    return null;
  }

  const showPreviousYear = Boolean(getValues().year);

  return (
    <div className="relative" style={{ maxWidth: 1000, height: 500 }} data-cy="consumption-chart">
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
          barCategoryGap={5}
        >
          <XAxis
            interval="preserveStartEnd"
            axisLine={false}
            tickLine={false}
            dataKey="chartTimestamp"
            tick={{ fill: isDarkMode ? chartColors.xAxis.dark : chartColors.xAxis.light }}
          />
          {isLargeDevice && (
            <YAxis
              dx={-50}
              textAnchor="start"
              axisLine={false}
              tickLine={false}
              domain={[0, calculateYAxisDomain]}
              tick={{ fill: isDarkMode ? chartColors.yAxis.dark : chartColors.yAxis.light }}
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
          <BarSeries aggregatedOn={data?.aggregatedOn} isDarkMode={isDarkMode} showPreviousYear={showPreviousYear} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
