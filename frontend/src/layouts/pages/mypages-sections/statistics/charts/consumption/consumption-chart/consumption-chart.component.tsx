'use client';

import {
  Bar,
  ComposedChart,
  DefaultZIndexes,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ZIndexLayer,
  BarShapeProps,
  usePlotArea,
} from 'recharts';
import { useLayoutEffect, useRef, useState, type ComponentProps } from 'react';
import CustomTooltip from '@layouts/pages/mypages-sections/statistics/charts/custom-tooltip.component';
import {
  useStatisticsFilter,
  useStatisticsPeriod,
} from '@layouts/pages/mypages-sections/statistics/statistics-filter/statistics-filter.store';
import { MergedStatisticsMeasurementData, StatisticsMeasurementData, Aggregation } from '@interfaces/measurement-data';
import { useDarkMode, useMediaQuery } from 'usehooks-ts';
import { chartColors } from '@utils/chart-colors.const';
import {
  addTemperatureToMeasurementPoints,
  canShowTemperature,
  fillChartPeriod,
} from '@services/measurement-data-service';
import { isNormalYear } from '@utils/normal-year';
import { makeMask } from '../../mask.component';
import { useTranslation } from 'react-i18next';

export interface ConsumptionChartProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
  showTemperature?: boolean;
}

const TEMPERATURE_AXIS_ID = 'temperature';

const calculateYAxisDomain = (dataMax: number) => {
  if (dataMax < 10) {
    return Math.floor(dataMax) + 2;
  }
  if (dataMax < 100) {
    return (Math.floor(dataMax / 10) + 1) * 10;
  }
  if (dataMax < 1000) {
    return (Math.floor(dataMax / 100) + 1) * 100;
  }
  return (Math.floor(dataMax / 1000) + 1) * 1000;
};

interface BarValuePoint {
  value?: number;
  previousValue?: number;
  values?: number[];
}

const getMaxBarValue = (points: BarValuePoint[] = []) =>
  Math.max(
    0,
    ...points.map((point) =>
      Math.max(
        point.value ?? 0,
        point.previousValue ?? 0,
        (point.values ?? []).reduce((sum, v) => sum + (v ?? 0), 0)
      )
    )
  );

// Smallest allowed tick size. Digits are roughly 0.6em wide, so the char width follows from it.
const AXIS_FONT_SIZE = 14;
const Y_AXIS_CHAR_WIDTH = 9;
const Y_AXIS_LABEL_GAP = 8;
// Recharts places tick text tickSize (6) + tickMargin (2) from the axis line.
const Y_AXIS_TICK_OFFSET = 8;
// Fits labels like "-20" and "25".
const TEMPERATURE_AXIS_WIDTH = 3 * Y_AXIS_CHAR_WIDTH + Y_AXIS_LABEL_GAP;

const getYAxisWidth = (dataMax: number) => {
  const top = calculateYAxisDomain(dataMax);
  // Small domains get decimal ticks such as "4.5".
  const chars = top < 10 ? 3 : String(top).length;
  return chars * Y_AXIS_CHAR_WIDTH + Y_AXIS_LABEL_GAP;
};

// Recharts applies barCategoryGap on both sides of every slot, so a fixed px gap eats narrow slots
// (31 days at 600px left <1px compare bars). Percentages scale with the slot.
const getBarCategoryGap = (aggregatedOn: string | undefined, isLargeDevice: boolean) => {
  if (!isLargeDevice) return '20%';
  return aggregatedOn === Aggregation.QUARTER ? '15%' : '18%';
};

const mobileTickFormatter = (aggregatedOn?: string) => (value: string, index: number) => {
  switch (aggregatedOn) {
    case Aggregation.DAY: {
      const day = Number.parseInt(value, 10);
      return day === 1 || (day % 5 === 0 && day <= 30) ? value : '';
    }
    case Aggregation.HOUR:
    case Aggregation.QUARTER:
      return Number.parseInt(value, 10) % 2 === 0 ? value : '';
    case Aggregation.MONTH:
      return index % 2 === 0 ? value : '';
    default:
      return value;
  }
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

type AboveBarTooltipProps = ComponentProps<typeof CustomTooltip> & {
  coordinate?: { x: number; y: number };
};

const AboveBarTooltip = ({ coordinate, ...props }: AboveBarTooltipProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const plotArea = usePlotArea();

  useLayoutEffect(() => {
    setWidth(boxRef.current?.offsetWidth ?? 0);
  }, [props.label, props.payload]);

  if (!props.active || !props.payload?.length || !coordinate || !plotArea) {
    return null;
  }

  const left = clamp(coordinate.x - width / 2, plotArea.x, plotArea.x + plotArea.width - width);

  return (
    <div
      ref={boxRef}
      className="absolute w-max -translate-y-full"
      style={{
        left,
        top: -4,
        visibility: width ? 'visible' : 'hidden',
      }}
    >
      <CustomTooltip {...props} />
    </div>
  );
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

const barShape = (
  props: BarShapeProps & {
    index: number;
    isDarkMode: boolean;
    stroked?: boolean;
    maskId?: string;
    radius?: number;
    gap?: number;
  }
) => {
  const gap = props.gap ?? 4;
  const r = props.radius ?? 2;
  const width = Number(props.width);
  const strokeWidth = props.stroked && width > 4 ? 1 : 0;

  const fill = props.isDarkMode ? chartColors.stackBar.dark[props.index] : chartColors.stackBar.light[props.index];
  const stroke = props.isDarkMode
    ? chartColors.stackBar.borderDark[props.index]
    : chartColors.stackBar.borderLight[props.index];

  return (
    <rect
      mask={props.maskId ? `url(#${props.maskId})` : ''}
      x={Number(props.x ?? 0)}
      y={Number(props.y ?? 0)}
      width={width}
      height={Math.max(0, Number(props.height) - (gap + strokeWidth))}
      rx={r}
      ry={r}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};

const QuarterlyBars = ({ isDarkMode }: QuarterlyBarsProps) => {
  return (
    <>
      {makeMask('mask-stripe', 3, 2)}
      {[0, 1, 2, 3].map((b, idx) => {
        return (
          <Bar
            key={`bar-${b}`}
            dataKey={`values[${idx}]`}
            maxBarSize={14}
            stackId="a"
            shape={(props) =>
              barShape({
                ...props,
                index: idx,
                isDarkMode,
                stroked: true,
                maskId: idx === 1 ? 'mask-stripe' : undefined,
                radius: 2,
                gap: 4,
              })
            }
          />
        );
      })}
    </>
  );
};

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

interface BarCursorProps {
  dataLength: number;
  points?: { x: number; y: number }[];
  top?: number;
  width?: number;
  height?: number;
}

const BarCursor = ({ dataLength, points, top = 0, width = 0, height = 0 }: BarCursorProps) => {
  if (!points?.length || !dataLength) {
    return null;
  }
  const bandSize = width / dataLength;
  return (
    <ZIndexLayer zIndex={DefaultZIndexes.cursorRectangle}>
      <rect
        className="recharts-tooltip-cursor"
        x={points[0].x - bandSize / 2}
        y={top + 0.5}
        width={bandSize}
        height={height - 1}
        fill="#ccc"
        pointerEvents="none"
      />
    </ZIndexLayer>
  );
};

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
            cursor={<BarCursor dataLength={chartData?.length ?? 0} />}
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
