'use client';

import { ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  useStatisticsFilter,
  useStatisticsPeriod,
} from '@layouts/pages/mypages-sections/statistics/statistics-filter/statistics-filter.store';
import { MergedStatisticsMeasurementData, StatisticsMeasurementData } from '@interfaces/measurement-data';
import { useDarkMode, useMediaQuery } from 'usehooks-ts';
import { chartColors } from '@utils/chart-colors.const';
import {
  addTemperatureToMeasurementPoints,
  canShowTemperature,
  fillChartPeriod,
} from '@services/measurement-data-service';
import { isNormalYear } from '@utils/normal-year';
import { useTranslation } from 'react-i18next';
import { AboveBarTooltip } from './above-bar-tooltip.component';
import { BarSeries } from './bar-series.component';
import {
  AXIS_FONT_SIZE,
  TEMPERATURE_AXIS_WIDTH,
  Y_AXIS_TICK_OFFSET,
  calculateYAxisDomain,
  getBarCategoryGap,
  getMaxBarValue,
  getYAxisWidth,
  mobileTickFormatter,
} from './consumption-chart.utils';

export interface ConsumptionChartProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
  showTemperature?: boolean;
}

const TEMPERATURE_AXIS_ID = 'temperature';

export const ConsumptionChart = (props: ConsumptionChartProps) => {
  const isLargeDevice = useMediaQuery('(min-width: 600px)');
  const compareYear = useStatisticsFilter((state) => state.compareYear);
  const { fromDate } = useStatisticsPeriod();
  const { isDarkMode } = useDarkMode();
  const { t } = useTranslation();
  const { data, showTemperature = false } = props;

  if (!data?.measurementData) {
    return null;
  }

  const showPreviousYear = Boolean(compareYear);
  const temperatureVisible = showTemperature && canShowTemperature(data);
  const previousTemperatureVisible = temperatureVisible && showPreviousYear && !isNormalYear(compareYear);
  const temperatureColor = isDarkMode ? chartColors.temperature.dark : chartColors.temperature.light;
  const filledData = fillChartPeriod(data, fromDate);
  const chartData = temperatureVisible
    ? addTemperatureToMeasurementPoints(filledData)
    : filledData.measurementData?.[0]?.measurementPoints;
  const yAxisWidth = getYAxisWidth(getMaxBarValue(chartData));

  return (
    <div
      className="relative -mx-12 h-[240px] stats:mx-0 stats:h-[300px]"
      style={{ maxWidth: 1000 }}
      data-cy="consumption-chart"
    >
      <span className="absolute bottom-[100%] left-0">
        <strong>{data.unit}</strong>
      </span>
      {temperatureVisible && (
        <span className="absolute bottom-[100%] right-0 hidden stats:block">
          <strong>{t('statistics:temperature.unit')}</strong>
        </span>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          width={1000}
          height={500}
          data={chartData}
          margin={{
            top: 0,
            right: 2,
            left: 4,
            bottom: 4,
          }}
          barCategoryGap={getBarCategoryGap(data.aggregatedOn, isLargeDevice)}
          barGap={isLargeDevice ? 2 : 1}
        >
          <XAxis
            interval={0}
            axisLine={{ stroke: isDarkMode ? chartColors.xAxis.dark : chartColors.xAxis.light, strokeWidth: 0.5 }}
            tickLine={false}
            dataKey="chartTimestamp"
            tickFormatter={isLargeDevice ? undefined : mobileTickFormatter(data.aggregatedOn)}
            tick={{ fill: isDarkMode ? chartColors.xAxis.dark : chartColors.xAxis.light, fontSize: AXIS_FONT_SIZE }}
          />
          <YAxis
            width={yAxisWidth}
            // Left-align labels at the axis' left edge.
            dx={-(yAxisWidth - Y_AXIS_TICK_OFFSET)}
            textAnchor="start"
            axisLine={false}
            tickLine={false}
            domain={[0, calculateYAxisDomain]}
            tick={{
              fill: isDarkMode ? chartColors.yAxis.dark : chartColors.yAxis.light,
              fontSize: AXIS_FONT_SIZE,
            }}
          />
          <Tooltip
            position={{ x: 0, y: 0 }}
            wrapperStyle={{ zIndex: 10 }}
            // The active slot is highlighted by dimming the other bars instead.
            cursor={false}
            content={
              <AboveBarTooltip
                fromDate={fromDate}
                year={compareYear}
                isConsumption={true}
                aggregatedOn={data?.aggregatedOn}
                active={undefined}
                payload={undefined}
                label={undefined}
                isDarkMode={isDarkMode}
                unit={data.unit}
              />
            }
          />
          <BarSeries aggregatedOn={data?.aggregatedOn} isDarkMode={isDarkMode} showPreviousYear={showPreviousYear} />
          {temperatureVisible && (
            <>
              <YAxis
                yAxisId={TEMPERATURE_AXIS_ID}
                orientation="right"
                hide={!isLargeDevice}
                width={TEMPERATURE_AXIS_WIDTH}
                // Right-align labels at the axis' right edge.
                dx={TEMPERATURE_AXIS_WIDTH - Y_AXIS_TICK_OFFSET}
                textAnchor="end"
                domain={['auto', 'auto']}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: isDarkMode ? chartColors.yAxis.dark : chartColors.yAxis.light,
                  fontSize: AXIS_FONT_SIZE,
                }}
              />
              <Line
                yAxisId={TEMPERATURE_AXIS_ID}
                type="monotone"
                dataKey="temperature"
                stroke={temperatureColor}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              {previousTemperatureVisible && (
                <Line
                  yAxisId={TEMPERATURE_AXIS_ID}
                  type="monotone"
                  dataKey="previousTemperature"
                  stroke={temperatureColor}
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              )}
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
