import { Aggregation } from '@interfaces/measurement-data';

export const calculateYAxisDomain = (dataMax: number) => {
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

export const getMaxBarValue = (points: BarValuePoint[] = []) =>
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
export const AXIS_FONT_SIZE = 14;
const Y_AXIS_CHAR_WIDTH = Math.ceil(AXIS_FONT_SIZE * 0.6);
// Space between the y-axis labels and the plot area.
const Y_AXIS_LABEL_GAP = 8;
// Recharts places tick text tickSize (6) + tickMargin (2) from the axis line.
export const Y_AXIS_TICK_OFFSET = 8;

const getAxisWidth = (chars: number) => chars * Y_AXIS_CHAR_WIDTH + Y_AXIS_LABEL_GAP;

// Fits labels like "-20" and "25".
export const TEMPERATURE_AXIS_WIDTH = getAxisWidth(3);

export const getYAxisWidth = (dataMax: number) => {
  const top = calculateYAxisDomain(dataMax);
  // Small domains get decimal ticks such as "4.5".
  return getAxisWidth(top < 10 ? 3 : String(top).length);
};

// Recharts applies barCategoryGap on both sides of every slot, so a fixed px gap eats narrow slots
// (31 days at 600px left <1px compare bars). Percentages scale with the slot.
export const getBarCategoryGap = (aggregatedOn: string | undefined, isLargeDevice: boolean) => {
  if (!isLargeDevice) return '20%';
  return aggregatedOn === Aggregation.QUARTER ? '15%' : '18%';
};

export const mobileTickFormatter = (aggregatedOn?: string) => (value: string, index: number) => {
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
