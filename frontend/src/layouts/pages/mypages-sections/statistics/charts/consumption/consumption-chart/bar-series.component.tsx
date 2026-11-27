'use client';

import { Bar, BarShapeProps, Rectangle, useActiveTooltipLabel, useIsTooltipActive } from 'recharts';
import { chartColors } from '@utils/chart-colors.const';
import { makeMask } from '../../mask.component';

interface ChartBarShapeStyle {
  fill: string;
  stroke: string;
  radius: number | [number, number, number, number];
  maskId?: string;
  // Stacked segments: space left above each segment. Thin segments also drop their stroke.
  stackGap?: number;
}

// Shared shape for every bar series. Dims the bar when another slot is active in the tooltip.
const ChartBarShape = ({
  x,
  y,
  width,
  height,
  payload,
  fill,
  stroke,
  radius,
  maskId,
  stackGap,
}: BarShapeProps & ChartBarShapeStyle) => {
  const isTooltipActive = useIsTooltipActive();
  const activeLabel = useActiveTooltipLabel();
  const isDimmed =
    isTooltipActive && activeLabel !== undefined && String(payload?.chartTimestamp) !== String(activeLabel);

  const strokeWidth = stackGap === undefined || width > 4 ? 1 : 0;
  const heightInset = stackGap === undefined ? 0 : stackGap + strokeWidth;

  return (
    <Rectangle
      x={x}
      y={y}
      width={width}
      height={Math.max(0, height - heightInset)}
      radius={radius}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      mask={maskId ? `url(#${maskId})` : undefined}
      className="transition-opacity duration-150"
      style={{ opacity: isDimmed ? 0.4 : 1 }}
    />
  );
};

interface SingleBarProps {
  isDarkMode: boolean;
}

const SingleBar = ({ isDarkMode }: SingleBarProps) => {
  const colors = isDarkMode ? chartColors.singleBar.dark : chartColors.singleBar.light;
  return (
    <Bar
      dataKey="value"
      shape={(props) => <ChartBarShape {...props} fill={colors.fill} stroke={colors.stroke} radius={2} />}
    />
  );
};

interface QuarterlyBarsProps {
  isDarkMode: boolean;
}

const QuarterlyBars = ({ isDarkMode }: QuarterlyBarsProps) => {
  const fills = isDarkMode ? chartColors.stackBar.dark : chartColors.stackBar.light;
  const strokes = isDarkMode ? chartColors.stackBar.borderDark : chartColors.stackBar.borderLight;
  return (
    <>
      {makeMask('mask-stripe', 3, 2)}
      {[0, 1, 2, 3].map((idx) => (
        <Bar
          key={`bar-${idx}`}
          dataKey={`values[${idx}]`}
          maxBarSize={14}
          stackId="a"
          shape={(props) => (
            <ChartBarShape
              {...props}
              fill={fills[idx]}
              stroke={strokes[idx]}
              radius={2}
              maskId={idx === 1 ? 'mask-stripe' : undefined}
              stackGap={4}
            />
          )}
        />
      ))}
    </>
  );
};

interface PreviousValueBarProps {
  isDarkMode: boolean;
}

const PreviousValueBar = ({ isDarkMode }: PreviousValueBarProps) => {
  const colors = isDarkMode ? chartColors.previousValue.dark : chartColors.previousValue.light;
  return (
    <Bar
      dataKey="previousValue"
      shape={(props) => <ChartBarShape {...props} fill={colors.fill} stroke={colors.stroke} radius={[4, 4, 0, 0]} />}
    />
  );
};

interface BarSeriesProps {
  aggregatedOn?: string;
  isDarkMode: boolean;
  showPreviousYear: boolean;
}

export const BarSeries = ({ aggregatedOn, isDarkMode, showPreviousYear }: BarSeriesProps) => (
  <>
    {aggregatedOn === 'QUARTER' ? <QuarterlyBars isDarkMode={isDarkMode} /> : <SingleBar isDarkMode={isDarkMode} />}
    {showPreviousYear && <PreviousValueBar isDarkMode={isDarkMode} />}
  </>
);
