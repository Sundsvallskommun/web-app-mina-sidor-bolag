import React from 'react';
import dayjs from 'dayjs';
import { Aggregation, Months } from '@interfaces/measurement-data';

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
  payload: { previousValue?: number };
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

// Sub-components
interface QuarterTooltipProps {
  fromDate: string;
  label?: keyof typeof Months;
  payload: PayloadItem[];
  unit: string;
}

const QuarterTooltip: React.FC<QuarterTooltipProps> = ({ fromDate, label, payload, unit }) => {
  const values = payload.map((p) => p.value);
  const total = values.reduce((acc, val) => acc + val, 0);

  return (
    <div className="shadow-100 rounded-cards px-24 py-14 bg-background-content">
      {formatDateLabel(Aggregation.QUARTER, fromDate, label)}

      <p>
        <b>
          {dayjs(fromDate).format('YYYY')}: {formatNumber(total)} {unit}
        </b>
      </p>
      {values.map((value, index) => (
        <p className="ml-8" key={index}>
          <b>
            {(index + 1) * 15}min: {formatNumber(value)} {unit}
          </b>
        </p>
      ))}
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
    return <QuarterTooltip fromDate={fromDate} label={label} payload={payload} unit={unit} />;
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
