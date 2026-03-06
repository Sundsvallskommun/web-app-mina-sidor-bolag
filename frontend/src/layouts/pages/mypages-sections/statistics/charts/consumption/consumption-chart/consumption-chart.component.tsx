'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CustomTooltip from '@layouts/pages/mypages-sections/statistics/charts/custom-tooltip.component';
import { useFormContext } from 'react-hook-form';
import { MergedStatisticsMeasurementData, StatisticsMeasurementData } from '@interfaces/measurement-data';
import React from 'react';
import { useDarkMode, useMediaQuery } from 'usehooks-ts';

export interface ConsumptionChartProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
}

interface IBarWithGapProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  radius?: number | number[];
}

const BarWithGap = (props: IBarWithGapProps) => {
  const { x, y, width, height, fill, radius } = props;
  const gap = 3;
  if (height === undefined || height <= gap) return null;
  return (
    <rect
      x={x}
      y={(y ?? 0) + gap}
      width={width}
      height={height - gap}
      fill={fill}
      rx={Array.isArray(radius) ? radius[0] : (radius ?? 0)}
      ry={Array.isArray(radius) ? radius[0] : (radius ?? 0)}
    />
  );
};

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

interface QuarterlyBarsProps {
  isDarkMode: boolean;
}

const QuarterlyBars = ({ isDarkMode }: QuarterlyBarsProps) => (
  <>
    <Bar
      className="dark:bg-background-content"
      dataKey="values[0]"
      fill={isDarkMode ? '#FF6B9D' : '#6B001F'}
      radius={3}
      stroke={isDarkMode ? '#FF6B9D' : '#6B001F'}
      strokeWidth="1"
      stackId="a"
      barSize={15}
      shape={<BarWithGap />}
    />
    <Bar
      className="dark:bg-background-content"
      dataKey="values[1]"
      fill={isDarkMode ? '#FF99C8' : '#CFA3AC'}
      radius={3}
      stroke={isDarkMode ? '#FF99C8' : '#CFA3AC'}
      strokeWidth="1"
      stackId="a"
      barSize={15}
      shape={<BarWithGap />}
    />
    <Bar
      className="dark:bg-background-content"
      dataKey="values[2]"
      fill={isDarkMode ? '#D97D9F' : '#A35C6B'}
      radius={3}
      stroke={isDarkMode ? '#D97D9F' : '#A35C6B'}
      strokeWidth="1"
      stackId="a"
      barSize={15}
      shape={<BarWithGap />}
    />
    <Bar
      className="dark:bg-background-content"
      dataKey="values[3]"
      fill={isDarkMode ? '#B8A8B8' : '#E8D6DA'}
      radius={3}
      stroke={isDarkMode ? '#B8A8B8' : '#E8D6DA'}
      strokeWidth="1"
      stackId="a"
      barSize={15}
      shape={<BarWithGap />}
    />
  </>
);

interface SingleBarProps {
  isDarkMode: boolean;
}

const SingleBar = ({ isDarkMode }: SingleBarProps) => (
  <Bar
    className="dark:bg-background-content"
    dataKey="value"
    fill={isDarkMode ? '#FAE9E7' : '#600724'}
    radius={[4, 4, 0, 0]}
    stroke={isDarkMode ? '#FAE9E7' : '#600724'}
    strokeWidth="1"
  />
);

interface PreviousValueBarProps {
  isDarkMode: boolean;
}

const PreviousValueBar = ({ isDarkMode }: PreviousValueBarProps) => (
  <Bar
    dataKey="previousValue"
    fill={isDarkMode ? '#2F2E2E' : '#FAE9E7'}
    radius={[4, 4, 0, 0]}
    stroke={isDarkMode ? '#FAE9E7' : '#600724'}
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
            tick={{ fill: isDarkMode ? '#FFFFFF' : '#444450' }}
          />
          {isLargeDevice && (
            <YAxis
              dx={-50}
              textAnchor="start"
              axisLine={false}
              tickLine={false}
              domain={[0, calculateYAxisDomain]}
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
          <BarSeries aggregatedOn={data?.aggregatedOn} isDarkMode={isDarkMode} showPreviousYear={showPreviousYear} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
