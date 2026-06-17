import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Aggregation, Months } from '@interfaces/measurement-data';
import { chartColors } from '@utils/chart-colors.const';
import { isNormalYear } from '@utils/normal-year';
import { makeMask } from './mask.component';

const LOCALE = 'se';
const UNIT_CONSUMPTION = 'kWh';
const UNIT_TEMPERATURE = 'ºC';
const PAYLOAD_NAMES = {
  CURRENT: 'value',
  PREVIOUS: 'previousValue',
} as const;

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
  isDarkMode?: boolean;
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

interface QuarterTooltipProps {
  payload: PayloadItem[];
  unit: string;
  isDarkMode: boolean;
}

const legendTeckShape = (props: { index: number; isDarkMode: boolean; maskId?: string }) => {
  const stroked = true;
  const width = 14;
  const height = 14;
  const radius = 2;
  const stripSize = 2;
  const maskSize = 1;
  const strokeWidth = stroked && width > 4 ? 1 : 0;

  const fill = props.isDarkMode ? chartColors.stackBar.dark[props.index] : chartColors.stackBar.light[props.index];
  const stroke = props.isDarkMode
    ? chartColors.stackBar.borderDark[props.index]
    : chartColors.stackBar.borderLight[props.index];

  return (
    <svg width={width} height={height} style={{ marginRight: '8px', verticalAlign: 'middle' }}>
      {props.maskId && makeMask(props.maskId, stripSize, maskSize)}
      <rect
        mask={props.maskId ? `url(#${props.maskId})` : ''}
        x={0}
        y={0}
        width={width}
        height={height - strokeWidth}
        rx={radius}
        ry={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

const QuarterTooltip: React.FC<QuarterTooltipProps> = ({ payload, unit, isDarkMode }) => {
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
            isDarkMode: isDarkMode ?? false,
            maskId: index === 1 ? 'tool-mask' : undefined,
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
  const { t } = useTranslation('statistics');
  const normalYear = isNormalYear(year?.toString());

  const currentLabel = normalYear ? t('statistics:consumption.totalConsumption') : dayjs(fromDate).format('YYYY');
  const comparisonLabel = normalYear ? t('statistics:consumption.correctedConsumption') : (year?.toString() ?? null);

  const currentValueItem = payload.find((p) => p.name === PAYLOAD_NAMES.CURRENT);
  const previousValueItem = payload.find((p) => p.name === PAYLOAD_NAMES.PREVIOUS);

  return (
    <div className="shadow-100 rounded-cards px-24 py-14 bg-background-content">
      {formatDateLabel(aggregatedOn, fromDate, label)}

      {currentValueItem && (
        <p>
          <strong>{currentLabel}:</strong> {formatNumber(currentValueItem.value)} {unit}
        </p>
      )}

      {comparisonLabel && previousValueItem && (
        <p>
          <strong>{comparisonLabel}:</strong> {formatNumber(previousValueItem.payload.previousValue ?? 0)} {unit}
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
  isDarkMode,
}: CustomTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const unit = getUnit(isConsumption);

  if (aggregatedOn === Aggregation.QUARTER) {
    return <QuarterTooltip payload={payload} unit={unit} isDarkMode={isDarkMode ?? false} />;
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
