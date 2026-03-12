import React from 'react';
import dayjs from 'dayjs';
import { Aggregation, Months } from '@interfaces/measurement-data';
import { chartColors } from '@utils/chart-colors.const';

// Constants
const LOCALE = 'se';
const UNIT_CONSUMPTION = 'kWh';
const UNIT_TEMPERATURE = 'ºC';
const PAYLOAD_NAMES = {
  CURRENT: 'value',
  PREVIOUS: 'previousValue',
} as const;

// Types
type PayloadItem = {
  value: number;
  payload: { previousValue?: number; timestamp?: string };
  name: string;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: PayloadItem[];
  label?: keyof typeof Months;
  fromDate: string;
  year?: number;
  isConsumption: boolean;
  aggregatedOn?: Aggregation;
}

// Helper functions
const getUnit = (isConsumption: boolean) => (isConsumption ? UNIT_CONSUMPTION : UNIT_TEMPERATURE);

const formatNumber = (value: number) =>
  new Intl.NumberFormat(LOCALE, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);

const formatDateLabel = (
  aggregatedOn: Aggregation | undefined,
  fromDate: string,
  label: keyof typeof Months | undefined
) => {
  switch (aggregatedOn) {
    case Aggregation.QUARTER:
    case Aggregation.HOUR:
      return (
        <strong>
          {dayjs(fromDate).format('D MMMM').toLowerCase()} kl {String(label)}.00
        </strong>
      );
    case Aggregation.DAY:
      return (
        <strong>
          {label} {dayjs(fromDate).format('MMMM').toLowerCase()}
        </strong>
      );
    case Aggregation.MONTH:
      return <strong>{label && Months[label]}</strong>;
    default:
      return null;
  }
};

// Mask component
interface MaskProps {
  stripSize: number;
  maskSize: number;
  maskId: string;
}

const Mask: React.FC<MaskProps> = ({ stripSize, maskSize, maskId }) => {
  return (
    <defs>
      <pattern
        id="pattern-stripe"
        width={stripSize}
        height={stripSize}
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(55)"
      >
        <rect width={maskSize} height={stripSize} transform="translate(0,0)" fill="white"></rect>
      </pattern>
      <mask id={maskId}>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-stripe)" />
      </mask>
    </defs>
  );
};

// Sub-components
interface QuarterTooltipProps {
  payload: PayloadItem[];
  unit: string;
}

const legendTeckShape = (props: {
  index: number;
  isDarkMode: boolean;
  stroked?: boolean;
  masked?: boolean;
  maskId?: string;
  radius?: number;
  height?: number;
  width?: number;
}) => {
  const r = props.radius ?? 2;
  const width = Number(props.width);
  const stripSize = 2;
  const maskSize = 1;
  const strokeWidth = props.stroked && width > 4 ? 1 : 0;

  const fill = props.isDarkMode ? chartColors.stackBar.dark[props.index] : chartColors.stackBar.light[props.index];
  const stroke = props.isDarkMode
    ? chartColors.stackBar.borderDark[props.index]
    : chartColors.stackBar.borderLight[props.index];

  return (
    <svg width={width} height={Number(props.height)} style={{ marginRight: '8px', verticalAlign: 'middle' }}>
      {props.masked && <Mask stripSize={stripSize} maskSize={maskSize} maskId={props.maskId ?? 'mask'} />}
      <rect
        mask={props.masked ? `url(#${props.maskId})` : ''}
        x={0}
        y={0}
        width={width}
        height={Number(props.height) - strokeWidth}
        rx={r}
        ry={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

const QuarterTooltip: React.FC<QuarterTooltipProps> = ({ payload, unit }) => {
  const items = payload.map((item, index) => {
    const fromMin = dayjs(item.payload.timestamp)
      .add(index * 15, 'minute')
      .format('HH:mm');
    const toMin = dayjs(item.payload.timestamp)
      .add((index + 1) * 15, 'minute')
      .format('HH:mm');
    return (
      <div key={'quarter-tooltip-item-' + index} className="flex flex-row items-center">
        <div className="h-18 m-0 flex items-center flex-row">
          {legendTeckShape({
            index,
            isDarkMode: false,
            width: 14,
            height: 14,
            masked: index === 1,
            maskId: 'tool-mask',
            stroked: true,
          })}
        </div>
        <div className="h-18 ml-4 flex items-center">
          {fromMin} – {toMin}
          <b className={'ml-12'}>
            {formatNumber(item.value)} {unit}
          </b>
        </div>
      </div>
    );
  });

  const reversedItems = [...items].reverse();

  return (
    <div className="flex flex-col gap-8 justify-evenly shadow-100 rounded-8 p-8 bg-background-content">
      {reversedItems}
    </div>
  );
};

interface StandardTooltipProps {
  fromDate: string;
  label?: keyof typeof Months;
  aggregatedOn?: Aggregation;
  payload: PayloadItem[];
  unit: string;
  year?: number;
}

const StandardTooltip: React.FC<StandardTooltipProps> = ({ fromDate, label, aggregatedOn, payload, unit, year }) => {
  const currYear = dayjs(fromDate).format('YYYY');
  const prevYear = year?.toString() ?? null;

  const currentValueItem = payload.find((p) => p.name === PAYLOAD_NAMES.CURRENT);
  const previousValueItem = payload.find((p) => p.name === PAYLOAD_NAMES.PREVIOUS);

  return (
    <div className="shadow-100 rounded-cards px-24 py-14 bg-background-content">
      {formatDateLabel(aggregatedOn, fromDate, label)}

      {currentValueItem && (
        <p>
          <strong>{currYear}:</strong> {formatNumber(currentValueItem.value)} {unit}
        </p>
      )}

      {prevYear && previousValueItem && (
        <p>
          <strong>{prevYear}:</strong> {formatNumber(previousValueItem.payload.previousValue ?? 0)} {unit}
        </p>
      )}
    </div>
  );
};

// Main component
export default function CustomTooltip({
  active,
  payload,
  label,
  fromDate,
  year,
  isConsumption,
  aggregatedOn,
}: CustomTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const unit = getUnit(isConsumption);

  if (aggregatedOn === Aggregation.QUARTER) {
    return <QuarterTooltip payload={payload} unit={unit} />;
  }

  return (
    <StandardTooltip
      fromDate={fromDate}
      label={label}
      aggregatedOn={aggregatedOn}
      payload={payload}
      unit={unit}
      year={year}
    />
  );
}
